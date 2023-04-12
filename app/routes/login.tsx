import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { Link, useActionData, useSearchParams } from "@remix-run/react";

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
import { authenticator } from "~/services/auth.server";
import { NoUserError } from "~/error";

export const loginValidator = withZod(
  z.object({
    redirectTo: zfd.text().optional(),
    email: zfd.text(z.string().email()),
    password: zfd.text(),
    remember: zfd.checkbox(),
  })
);

export async function loader({ request }: LoaderArgs) {
  return authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.clone().formData();

  const result = await loginValidator.validate(formData);
  if (result.error) {
    return validationError(result.error);
  }

  const { email, password, redirectTo, remember: _remember } = result.data;

  const redirectToUrl = safeRedirect(redirectTo, "/");

  // TODO: handle remember - probably have to fix it in `remix-auth`

  try {
    return (await authenticator.authenticate("form", request, {
      successRedirect: redirectToUrl,
      throwOnError: true,
      context: {
        type: "login",
        email,
        password,
      },
    })) as never;
  } catch (error) {
    if (error instanceof Error && error.cause instanceof NoUserError) {
      return validationError({
        fieldErrors: {
          password: "Invalid email or password",
        },
        formId: result.formId,
      });
    }

    throw error;
  }
}

export const meta: V2_MetaFunction = () => [{ title: "Login :: Csirip" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.fieldErrors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.fieldErrors.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  const isHydrated = useHydrated();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <ValidatedForm
          validator={loginValidator}
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
                  pathname: "/register",
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
