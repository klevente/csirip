import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useActionData, useSearchParams } from "@remix-run/react";

import { createUserSession, getUserId } from "~/session.server";
import { verifyLogin } from "~/models/user.server";
import { safeRedirect } from "~/utils";
import { FormInput } from "~/components/ui/form-input";
import { SubmitButton } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { useHydrated } from "remix-utils";
import { zfd } from "zod-form-data";
import { useEffect, useRef } from "react";

const validator = withZod(
  z.object({
    redirectTo: zfd.text().optional(),
    email: zfd.text(z.string().email()),
    password: zfd.text(),
    remember: zfd.checkbox(),
  })
);

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
}

export async function action({ request }: ActionArgs) {
  console.log("a");
  const formData = await request.formData();

  const result = await validator.validate(formData);
  if (result.error) {
    return validationError(result.error);
  }

  const { email, password, redirectTo, remember } = result.data;

  const redirectToUrl = safeRedirect(redirectTo, "/");

  const user = await verifyLogin(email, password);

  if (!user) {
    return validationError({
      fieldErrors: {
        password: "Invalid email or password",
      },
      formId: result.formId,
    });
  }

  return createUserSession({
    request,
    userId: user.id,
    remember,
    redirectTo: redirectToUrl,
  });
}

export const meta: V2_MetaFunction = () => [{ title: "Login :: Csirip" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.fieldErrors.email) {
      emailRef.current?.focus();
    } else if (actionData?.fieldErrors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  const isHydrated = useHydrated();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <ValidatedForm
          validator={validator}
          noValidate={isHydrated}
          method="post"
          className="flex flex-col space-y-6"
        >
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <FormInput
            label="Email address"
            placeholder="Email address"
            name="email"
            ref={emailRef}
            autoFocus
            type="email"
            autoComplete="email"
          />

          <FormInput
            label="Password"
            placeholder="Password"
            name="password"
            ref={passwordRef}
            type="password"
            autoComplete="current-password"
          />

          <SubmitButton fullWidth>Log in</SubmitButton>

          <div className="flex justify-between">
            <Checkbox label="Remember me" name="remember" />
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link
                className="underline"
                to={{
                  pathname: "/join",
                  search: searchParams.toString(),
                }}
              >
                Sign up
              </Link>
            </div>
          </div>
        </ValidatedForm>
      </div>
    </div>
  );
}
