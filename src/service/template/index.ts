import { ModifierNumber, ModifierString } from '../../model/meta/Modifier';
import { TemplateNumber, TemplatePrimitive, TemplateString } from '../../model/meta/Template';
import { VerbMap } from '../../util/types';

export interface TemplateService {
  modifyNumber(base: number, mod: ModifierNumber): number;
  modifyString(base: string, mod: ModifierString): string;
  modifyNumberList(base: Array<number>, mod: Array<ModifierNumber>): Array<number>;
  modifyStringList(base: Array<string>, mod: Array<ModifierString>): Array<string>;
  modifyNumberMap(base: Map<string, number>, mod: Map<string, ModifierNumber>): Map<string, number>;
  modifyStringMap(base: Map<string, string>, mod: Map<string, ModifierString>): Map<string, string>;

  renderString(input: TemplateString): string;
  renderNumber(input: TemplateNumber): number;
  renderNumberList(input: Array<TemplateNumber>): Array<number>;
  renderStringList(input: Array<TemplateString>): Array<string>;
  renderNumberMap(input: Map<string, TemplateNumber>): Map<string, number>;
  renderStringMap(input: Map<string, TemplateString>): Map<string, string>;
  renderVerbMap(input: TemplatePrimitive<VerbMap>): VerbMap;
}
