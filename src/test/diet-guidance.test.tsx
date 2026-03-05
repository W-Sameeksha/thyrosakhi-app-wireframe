import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DietGuidance from "@/pages/DietGuidance";

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "en",
    t: (key: string) => key,
  }),
}));

vi.mock("@/lib/screeningLock", () => ({
  isScreeningLocked: () => false,
}));

const renderDietWithRiskLevel = (riskLevel: "low" | "medium" | "high") => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/diet", state: { riskLevel } }]}>
      <Routes>
        <Route path="/diet" element={<DietGuidance />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("DietGuidance risk-based recommendations", () => {
  it("shows low-risk title and foods with icons", () => {
    renderDietWithRiskLevel("low");

    expect(screen.getByText("Maintain Healthy Thyroid Function")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.getByAltText("Eggs")).toBeInTheDocument();
  });

  it("shows moderate-risk foods with icons", () => {
    renderDietWithRiskLevel("medium");

    expect(screen.getByText("Support Thyroid Health")).toBeInTheDocument();
    expect(screen.getByText("Brazil nuts")).toBeInTheDocument();
    expect(screen.getByAltText("Brazil nuts")).toBeInTheDocument();
  });

  it("shows high-risk foods with icons", () => {
    renderDietWithRiskLevel("high");

    expect(screen.getByText("Possible Thyroid Risk Detected")).toBeInTheDocument();
    expect(screen.getByText("Leafy greens")).toBeInTheDocument();
    expect(screen.getByAltText("Leafy greens")).toBeInTheDocument();
  });
});
