import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow you to register and login", () => {
    const username = faker.internet.userName();
    const loginForm = {
      email: `${username}@example.com`,
      username,
      password: faker.internet.password(),
    };

    cy.then(() => ({ email: loginForm.email, username })).as("user");

    cy.visitAndCheck("/");

    cy.findByRole("link", { name: /sign up/i }).click();

    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByRole("textbox", { name: /username/i }).type(loginForm.username);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("button", { name: /create account/i }).click();

    cy.findByRole("button", { name: /logout/i }).should("be.visible");

    cy.findByRole("link", { name: /🐦/i }).click();
    cy.findByRole("button", { name: /logout/i }).click();
    cy.findByRole("link", { name: /login/i });
  });

  it("should allow you to make a post", () => {
    const testPost = faker.lorem.sentences(1);
    cy.login();

    cy.visitAndCheck("/");

    cy.findByRole("textbox").type(testPost);
    cy.findByRole("button", { name: /csirip!/i }).click();

    cy.findByText(testPost);
  });
});
