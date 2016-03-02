/// <reference path="../../../typings/angular2-meteor.d.ts" />

import {Component, Inject, ElementRef, Input, Output, EventEmitter, SimpleChange} from 'angular2/core'
import {NgFor, NgIf} from 'angular2/common'
import {TranslatePipe} from 'client/allgemein/translatePipe'
import {GlobalSetting} from  'client/globalsetting'

declare var jQuery
declare var Quill: any

@Component({
    selector: "ty-editor",
    pipes:[TranslatePipe],
    directives: [NgFor, NgIf],
    inputs: ['Content'],
    outputs:['onsave'],
    templateUrl: 'client/allgemein/directives/texteditor.html',
})

export class TYEditor{
    Content: string
    onsave = new EventEmitter();

    quill: any;

    private inited = false;
    private start: number;
    private end: number

    constructor(private rootElement: ElementRef,
                @Inject(GlobalSetting) public glsetting:GlobalSetting){

    }

    ngAfterViewInit(){
        this.quill = new Quill('#quill-editor');
        this.quill.addModule('toolbar', { container: '#quill-toolbar' });

        this.quill.on('selection-change', (range) => {
            if (range) {
                this.start = range.start
                this.end = range.end
            }
        });

        this.setContent(this.Content)
        this.inited = true

        jQuery(this.rootElement.nativeElement).find('.ui.dropdown.ql-size').dropdown({
            onChange: (value, text, $choice)=>{
                //console.log(value, text)

                if(this.start != this.end){
                    this.quill.formatText(this.start, this.end, 'size', value)
                }
            }
        })
    }

    ngOnDestroy(){
        if(!!this.quill){
            console.log("destroy quill")
            this.quill.destroy();
            this.quill = null;

        }
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if(this.inited == false)return;

        if(changes['Content']){

        }
    }

    Save(cancel){
        if(cancel == true){
            this.onsave.emit(null);
        }else{
            let content = this.quill.getHTML();
            this.onsave.emit((content || '<div></div>'))
        }
    }

    private setContent(html){
        if(!html || html == '')return
        this.quill.setHTML(html)
    }
}