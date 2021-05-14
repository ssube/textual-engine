import { Template, TemplateNumber, TemplateString } from "../../model/meta/Template";

export function renderString(input: TemplateString) {
  return input.base;
}

export function renderNumber(input: TemplateNumber) {
  return input.min;
}

export function renderNumberMap(input: Map<string, TemplateNumber>): Map<string, number> {
  const result = new Map();

  for (const [key, value] of input) {
    result.set(key, renderNumber(value));
  }

  return result;
}

export function renderStringMap(input: Map<string, TemplateString>): Map<string, string> {
  const result = new Map();

  for (const [key, value] of input) {
    result.set(key, renderString(value));
  }

  return result;
}

// TODO: export function renderNumberList(input: Array<TemplateNumber>): Array<number>;
// TODO: export function renderStringList(input: Array<TemplateString>): Array<string>;
