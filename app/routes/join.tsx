import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";

import { getUserId, createUserSession } from "~/session.server";

import {
  createUser,
  getUserByEmail,
  getUserByUsername,
} from "~/models/user.server";
import { safeRedirect } from "~/utils";
import { withZod } from "@remix-validated-form/with-zod";
import { zfd } from "zod-form-data";
import { z } from "zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { FormInput } from "~/components/ui/form-input";
import { SubmitButton } from "~/components/ui/button";
import { useEffect, useRef } from "react";
import { useHydrated } from "remix-utils";

const validator = z.object({
  redirectTo: zfd.text().optional(),
  email: zfd.text(z.string().email()),
  username: zfd.text(),
  password: zfd.text(z.string().min(8)),
});

const clientValidator = withZod(validator);

const serverValidator = withZod(
  validator
    .refine(
      async (data) => {
        return !(await getUserByUsername(data.username));
      },
      {
        message: "Username is taken",
        path: ["username"],
      }
    )
    .refine(
      async (data) => {
        return !(await getUserByEmail(data.email));
      },
      {
        message: "Email is taken",
        path: ["email"],
      }
    )
);

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const result = await serverValidator.validate(formData);

  if (result.error) {
    return validationError(result.error);
  }

  const { email, username, password, redirectTo } = result.data;
  const redirectToUrl = safeRedirect(redirectTo, "/");

  const user = await createUser(email, username, password);

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo: redirectToUrl,
  });
}

export const meta: V2_MetaFunction = () => [{ title: "Sign Up" }];

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.fieldErrors.email) {
      emailRef.current?.focus();
    } else if (actionData?.fieldErrors.password) {
      passwordRef.current?.focus();
    } else if (actionData?.fieldErrors.username) {
      usernameRef.current?.focus();
    }
  }, [actionData]);

  const isHydrated = useHydrated();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <ValidatedForm
          validator={clientValidator}
          noValidate={isHydrated}
          method="post"
          className="flex flex-col space-y-6"
        >
          <FormInput
            label="Email address"
            name="email"
            ref={emailRef}
            autoFocus
            type="email"
            autoComplete="email"
          />

          <FormInput label="Username" name="username" ref={usernameRef} />

          <FormInput
            label="Password"
            name="password"
            ref={passwordRef}
            type="password"
            autoComplete="new-password"
          />

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <SubmitButton fullWidth>Create Account</SubmitButton>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </ValidatedForm>
      </div>
    </div>
  );
}
