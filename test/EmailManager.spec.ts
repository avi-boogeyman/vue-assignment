import { render, fireEvent, screen } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import EmailManager from "../src/components/EmailManager.vue";

describe("EmailManager.vue", () => {
  it("renders the component correctly", async () => {
    render(EmailManager);
    expect(screen.getByText("Available Recipients")).toBeTruthy();
    expect(screen.getByText("Selected Recipients")).toBeTruthy();
  });

  it("allows adding a valid email", async () => {
    render(EmailManager);

    const input = screen.getByPlaceholderText("Enter email");
    const addButton = screen.getByRole("button", { name: "Add" });

    await fireEvent.update(input, "newuser@example.com");
    await fireEvent.click(addButton);

    expect(screen.getByText("newuser@example.com")).toBeTruthy();
  });

  it("shows error message for invalid email", async () => {
    render(EmailManager);

    const input = screen.getByPlaceholderText("Enter email");
    const addButton = screen.getByRole("button", { name: "Add" });

    await fireEvent.update(input, "invalid-email");
    await fireEvent.click(addButton);

    expect(await screen.findByText("Invalid email format")).toBeTruthy();
  });

  it("filters emails by search input", async () => {
    render(EmailManager);

    const input = screen.getByPlaceholderText("Enter email");
    await fireEvent.update(input, "qwerty");

    expect(screen.getByText("brian@qwerty.com")).toBeTruthy();
    expect(screen.getByText("james@qwerty.com")).toBeTruthy();
  });
});
