import type { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export function loader({ request, params }: LoaderArgs) {
  return authenticator.authenticate(params.provider as string, request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
}
