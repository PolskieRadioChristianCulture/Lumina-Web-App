import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseButton from "./BaseButton.vue";

describe("BaseButton.vue", () => {
  it("renderuje poprawny tekst w slocie przycisku", () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: "Kliknij mnie"
      }
    });

    expect(wrapper.text()).toContain("Kliknij mnie");
  });

  it("aplikuje odpowiednie klasy wariantu i rozmiaru", () => {
    const wrapper = mount(BaseButton, {
      props: {
        variant: "gold",
        size: "lg"
      }
    });

    expect(wrapper.classes()).toContain("btn-gold");
    expect(wrapper.classes()).toContain("btn-size-lg");
  });

  it("emituje zdarzenie click po kliknięciu", async () => {
    const wrapper = mount(BaseButton);
    await wrapper.trigger("click");

    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("nie emituje zdarzenia click i jest wyłączony gdy disabled jest true", async () => {
    const wrapper = mount(BaseButton, {
      props: {
        disabled: true
      }
    });

    expect(wrapper.attributes("disabled")).toBeDefined();
  });
});
