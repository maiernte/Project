/// <reference path="../../typings/angular2-meteor.d.ts" />
import {Component, Inject} from 'angular2/core'
import {NgFor} from 'angular2/common'

import {TranslatePipe} from 'client/allgemein/translatePipe'
import {GlobalSetting} from  'client/globalsetting'

import {LocalRecords, LocalBooks} from 'collections/books'
import {SemanticSelect} from './directives/smselect'

declare var jQuery:any;

@Component({
    selector: 'global-setting',
    templateUrl: 'client/allgemein/setting.html',
    pipes: [TranslatePipe],
    directives: [SemanticSelect]
})

export class AppSetting{
    private twlang: number
    private guaShenSha: number
    private guaSimple: number
    private baziShenSha: number
    private bookpagerd: number;
    private guaArrow: number;

    glsetting:GlobalSetting;
    constructor(@Inject(GlobalSetting) glsetting: GlobalSetting){
        this.glsetting = glsetting;
    }

    get IsCordova(){
        return this.glsetting.IsCordova
    }

    get TwLang(): number{
        return this.twlang;
    }

    set TwLang(value){
        this.twlang = value;
        this.glsetting.SetValue('lang', value == 1)
    }

    get GuaShenSha(): number{
        return this.guaShenSha;
    }

    set GuaShenSha(value){
        this.guaShenSha = value;
        let tosave = parseInt(value.toString()) + 4
        this.glsetting.SetValue('gua-shensha', tosave)
    }

    get BaziShenSha(): number{
        return this.baziShenSha;
    }

    set BaziShenSha(value){
        this.baziShenSha = value;
        let tosave = parseInt(value.toString()) + 4
        this.glsetting.SetValue('bazi-shensha', tosave)
    }

    get GuaSimple(): number{
        return this.guaSimple;
    }

    set GuaSimple(value){
        this.guaSimple = parseInt(value.toString());
        this.glsetting.SetValue('gua-simple', this.guaSimple == 1)
    }

    get BookPageRD()
    {
        return this.bookpagerd;
    }

    set BookPageRD(value){
        this.bookpagerd = value
        this.glsetting.SetValue('book-pagerd', value)
    }

    get GuaArrow(): number{
        return this.guaArrow
    }

    set GuaArrow(value){
        this.guaArrow = parseInt(value.toString());
        this.glsetting.SetValue('gua-arrow', this.guaArrow == 0)
    }

    showMenu(hide){
        if(hide === true){
            jQuery(document).find('.ui.labeled.sidebar').sidebar('hide')
        }else{
            jQuery(document).find('.ui.labeled.sidebar').sidebar('toggle');
        }
    }

    ngOnInit(){
        this.twlang = this.glsetting.lang ? 1 : 0;
        this.guaShenSha = parseInt(this.glsetting.GetSetting('gua-shensha').toString()) - 4;
        this.guaSimple = this.glsetting.GetSetting('gua-simple') == true ? 1 : 0;
        this.baziShenSha = parseInt(this.glsetting.GetSetting('bazi-shensha').toString()) - 4;
        this.bookpagerd = this.glsetting.PageSize;
        this.guaArrow = this.glsetting.GetSetting('gua-arrow') == true ? 0 : 1

        let hideMenu = true;
        this.showMenu(hideMenu);
    }
    
    ClearLocalDB(){
        let title = "清空本地数据"
        let msg = "所有本地数据将被清空。没有保存到云端的数据将永久丢失。确定进行此操作吗？"
        
        this.glsetting.Confirm(title, msg, () => {
            LocalRecords.clear();
            LocalBooks.clear();
        }, () => {
            console.log("cancel")
        })
    }

    ImportBook(event){
        var f = event.srcElement.files[0];
        var r = new FileReader();
        r.onload = () => {
            console.log(r.result)
        }

        console.log(f)
        r.readAsText(f);
    }
}