export class Item {
  
  constructor(
    public uid: string = '',
    // public categoryId: string = '',
    public name: string = '',
    public description: string = '',
    public tax: number = 0,
    public price: number = 0,
    public available: boolean = true,
    public photoUrl: string = '',
    public isWeightBased: boolean = false,
    public minWeight: number = 1,
    public maxWeight: number = 5,
    public optionGroupsId: string[] = []
  ) {}
  
}
