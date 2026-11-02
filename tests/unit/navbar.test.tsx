import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "@/components/layout/Navbar";

describe("Navbar Component", () => {
  it("renders brand name and navigation links", () => {
    render(<Navbar />);
    expect(screen.getByText("RasoiSync")).toBeInTheDocument();
    expect(screen.getByText("Demo Storefront")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("toggles mobile menu on button click", () => {
    render(<Navbar />);
    const toggleButton = screen.getByLabelText("Toggle menu");
    expect(toggleButton).toBeInTheDocument();

    // Click to open mobile menu
    fireEvent.click(toggleButton);
    expect(screen.getByText("Create Storefront")).toBeInTheDocument();
  });
});

