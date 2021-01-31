import { Option } from './option';

export class OptionGroup {
  
  constructor(
    public uid: string = '',
    public shopId: string = '',
    public name: string = '',
    public type: 'addable' | 'pickable' = 'addable',
    public options: Option[] = [],
    public amountOptionsRequired: number = 0
  ) {}
  
}
