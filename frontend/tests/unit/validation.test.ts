import { describe, it, expect } from "vitest";
import { loginSchema } from "@/lib/validation/auth";
import { productSchema } from "@/lib/validation/product";
import { categorySchema } from "@/lib/validation/category";

describe("Validation Schemas", () => {
  it("validates valid admin login payload", () => {
    const valid = { email: "admin@pjjewellery.com", password: "SuperPassword123!" };
    const result = loginSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email in login payload", () => {
    const invalid = { email: "not-an-email", password: "SuperPassword123!" };
    const result = loginSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates product schema requiring SKU and Title", () => {
    const result = productSchema.safeParse({
      sku: "PJ-RNG-001",
      title: "Solitaire Diamond Ring",
    });
    expect(result.success).toBe(true);
  });

  it("validates category schema requiring minimum 2 characters name", () => {
    const valid = categorySchema.safeParse({ name: "Rings" });
    const invalid = categorySchema.safeParse({ name: "R" });
    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });
});
