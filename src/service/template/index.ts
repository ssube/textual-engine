import { TemplateNumber, TemplatePrimitive, TemplateString } from '../../model/meta/Template';
import { VerbMap } from '../../util/types';

export interface TemplateService {
  renderString(input: TemplateString): string;
  renderNumber(input: TemplateNumber): number;
  renderNumberList(input: Array<TemplateNumber>): Array<number>;
  renderStringList(input: Array<TemplateString>): Array<string>;
  renderNumberMap(input: Map<string, TemplateNumber>): Map<string, number>;
  renderStringMap(input: Map<string, TemplateString>): Map<string, string>;
  renderVerbMap(input: TemplatePrimitive<VerbMap>): VerbMap;
}
