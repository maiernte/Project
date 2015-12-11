import {FetchWuXing} from 'lib/base/wuxing'


export class Gan{
    constructor(public index: number){
        
    }
    
    get Name(){
        return '甲';
    }
    
    get WuXing(){
        return FetchWuXing(0).name;
    }
}