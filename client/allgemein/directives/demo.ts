/// <reference path="../../../typings/angular2-meteor.d.ts" />

import {Component, Inject} from 'angular2/core'

import {TranslatePipe} from 'client/allgemein/translatePipe'
import {GlobalSetting} from  'client/globalsetting'
import {SemanticSelect, tyitem, tyoption} from './smselect'
import {TYEditor} from './texteditor'

import {TYSqlite} from 'client/books/tysqlite'

declare var jQuery:any;

@Component({
    selector: "huahe-demo",
    pipes:[TranslatePipe],
    directives: [SemanticSelect, TYEditor],
    templateUrl: 'client/allgemein/directives/demo.html',
})

export class Demo{
    private gender = 0
    State = 'AL'
    StateX = 'AK'

    jiazioptions: tyoption
    guaoptions: tyoption

    private selected: any

    SeletcedGua: any

    constructor(@Inject(GlobalSetting) public glsetting: GlobalSetting){

    }

    get IsAndroid(){
        return this.glsetting.Android
    }

    get Gender() {
        return this.gender
    }

    set Gender(value){
        this.gender = value;
        console.log('set gender', value)
    }

    get Seletcted(){
        return this.selected;
    }

    set Seletcted(value){
        console.log('set selected', value)
        this.selected = value
    }

    ngOnInit() {
        let hideMenu = true;
        this.showMenu(hideMenu);

        this.jiazioptions = {Items: []}
        this.jiazioptions.Items.push({Value: 0, Text: "甲子"})
        this.jiazioptions.Items.push({Value: 1, Text: "乙卯"})
        this.jiazioptions.Items.push({Value: 2, Text: "丙午"})

        this.guaoptions = {Groups: []}
        let g1 = {Name: '坤宫', Items: []}
        g1.Items.push({Value: 0, Text: "坤为地"})
        g1.Items.push({Value: 1, Text: "地泽临"})
        let g2 = {Name: '震宫', Items: []}
        g2.Items.push({Value: 2, Text: "雷天大壮"})
        g2.Items.push({Value: 3, Text: "雷泽归妹"})

        this.guaoptions.Groups.push(g1)
        this.guaoptions.Groups.push(g2)

        this.selected = 2
        this.SeletcedGua = 1
    }

    showMenu(hide) {
        if(hide === true){
            jQuery(document).find('.ui.labeled.sidebar').sidebar('hide')
        }else{
            jQuery(document).find('.ui.labeled.sidebar').sidebar('toggle');
        }
    }

    ngAfterViewInit(){

    }

    valueChanged(){
        let tmp = {Items: []}
        tmp.Items.push({Value: 0, Text: "庚午"})
        tmp.Items.push({Value: 1, Text: "丙午"})
        tmp.Items.push({Value: 2, Text: "壬戌"})

        this.jiazioptions = tmp;
    }

    loadExternSqlite(event){
        var f = event.srcElement.files[0];
        var r = new FileReader();
        r.onload = () => {
            let db = new TYSqlite(r.result)
            console.log(db.BookType)
        }

        //r.readAsArrayBuffer(f);
        r.readAsDataURL(f);
    }
}