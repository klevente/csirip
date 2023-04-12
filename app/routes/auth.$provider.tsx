import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export function loader() {
  return redirect("/login");
}

export function action({ request, params }: ActionArgs) {
  return authenticator.authenticate(params.provider as string, request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
}
