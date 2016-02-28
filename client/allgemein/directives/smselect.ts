/// <reference path="../../../typings/angular2-meteor.d.ts" />

import {Component, Inject, ElementRef, Input, Output, EventEmitter, SimpleChange} from 'angular2/core'
import {NgFor, NgIf} from 'angular2/common'
import {TranslatePipe} from 'client/allgemein/translatePipe'
import {GlobalSetting} from  'client/globalsetting'

declare var jQuery

@Component({
    selector: "sm-select",
    pipes:[TranslatePipe],
    directives: [NgFor, NgIf],
    inputs: ['Value', 'Options'],
    outputs:['valueChanged: Value'],
    templateUrl: 'client/allgemein/directives/smselect.html',
})
export class SemanticSelect{
    Options: tyoption;
    Value: any;
    valueChanged = new EventEmitter();
    Selected: tyitem;

    SimpleOptions: string;
    private inited = false
    private tran: TranslatePipe

    constructor(private rootElement: ElementRef,
                @Inject(GlobalSetting) public glsetting:GlobalSetting){
        //this.tran = new TranslatePipe()
    }

    get Grouped(){
        return !!this.Options.Groups;
    }

    get UseOrigin(){
        let isandroid = navigator.userAgent.match(/Android/i)
        return isandroid && this.Grouped;
    }

    ngOnInit(){
        if(!this.Options){
            this.Options = {Items: []}
            this.Selected = {Value: null, Text: ''}
            this.inited = true
            return
        }

        if(typeof this.Options == 'string'){
            this.buildOptions()
        }

        if(this.UseOrigin){
            this.convertOptions()
        }

        if(!!this.Value){
            this.Selected = this.getItem(this.Value)
        }else{
            this.Selected = this.Grouped ? this.Options.Groups[0].Items[0] : this.Options.Items[0];
        }

        this.inited = true;
    }

    ngAfterViewInit(){
        jQuery(this.rootElement.nativeElement).find('.ui.dropdown.semantic').dropdown({
            onChange: (value, text, $choice)=>{
                this.Selected = {Value: value, Text: text}
                /*if(typeof value == "string"){
                    value = this.tran.transform(value, false)
                }*/

                this.valueChanged.emit(value)
                //console.log('change selected', value, text, $choice)
            }
        })
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if(this.inited == false)return;

        if(changes['Value']){
            //console.log('ngOnChanges = ', changes['Value'].currentValue);
        }

        if(changes['Options']){
            let item = this.getItem(this.Value)
            if(!item && typeof this.Value == 'string'){
                item = this.Grouped ? this.Options.Groups[0].Items[0] : this.Options.Items[0];
            }

            this.Selected = item;
        }
    }

    changeValue(event){
        let value = event.srcElement['value']
        /*if(typeof value == "string"){
            value = this.tran.transform(value, false)
        }*/

        this.valueChanged.emit(value)
    }

    private getItem(value: any): tyitem{
        if(!value){
            return null
        }

        if(this.Grouped && !this.UseOrigin){
            for(let gp of this.Options.Groups){
                for(let item of gp['Items']){
                    if(item.Value == value){
                        return item;
                    }
                }
            }
        }else{
            for(let item of this.Options.Items){
                if(item.Value == value){
                    return item;
                }
            }
        }

        return null
    }

    private buildOptions(){
        //console.log('option is string')
        let text = this.Options.toString()
        let items = text.split(' ')
        let options = {Items: []}
        let value = 0;

        for(let i of items){
            options.Items.push({Value: value, Text: i})
            value = value + 1;
        }

        this.Options = options;
    }

    private convertOptions(){
        console.log('convert options')
        this.Options['Items'] = []
        for(let gp of this.Options.Groups){
            let header = {Value: null, Text: gp.Name}
            this.Options.Items.push(header)

            for(let i of gp.Items){
                this.Options.Items.push(i)
            }
        }

        this.Options.Groups = []
    }
}

export interface tyoption {
    Groups?: Array<{Name: string, Items: Array<tyitem>}>;
    Items?: Array<tyitem>
}

export interface tyitem {
    Value: any;
    Text: string;
}