import { TemplateNumber, TemplatePrimitive, TemplateString } from '../../model/meta/Template';
import { VerbMap } from '../../util/types';

export interface TemplateService {
  modifyNumber(base: number, mod: TemplateNumber): number;
  modifyString(base: string, mod: TemplateString): string;
  modifyNumberList(base: Array<number>, mod: Array<TemplateNumber>): Array<number>;
  modifyStringList(base: Array<string>, mod: Array<TemplateString>): Array<string>;
  modifyNumberMap(base: Map<string, number>, mod: Map<string, TemplateNumber>): Map<string, number>;
  modifyStringMap(base: Map<string, string>, mod: Map<string, TemplateString>): Map<string, string>;

  renderString(input: TemplateString): string;
  renderNumber(input: TemplateNumber): number;
  renderNumberList(input: Array<TemplateNumber>): Array<number>;
  renderStringList(input: Array<TemplateString>): Array<string>;
  renderNumberMap(input: Map<string, TemplateNumber>): Map<string, number>;
  renderStringMap(input: Map<string, TemplateString>): Map<string, string>;
  renderVerbMap(input: TemplatePrimitive<VerbMap>): VerbMap;
}
