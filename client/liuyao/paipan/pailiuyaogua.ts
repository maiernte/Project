/// <reference path="../../../typings/angular2-meteor.d.ts" />
import {Component, Inject, ElementRef} from 'angular2/core'
import {NgFor} from 'angular2/common'
import {TranslatePipe} from 'client/allgemein/translatePipe'
import {GlobalSetting} from  'client/globalsetting'
import {Gua64} from "../../../lib/base/gua"

import {SemanticSelect, tyoption, tyitem} from 'client/allgemein/directives/smselect'

declare var jQuery:any;

@Component({
    selector: 'pailiuyao-gua',
    pipes: [TranslatePipe],
    templateUrl: 'client/liuyao/paipan/pailiuyaogua.html',
    directives: [NgFor, SemanticSelect]
})

export class PaiLiuyaoGua{
    private rootElement: ElementRef;
    private guagongOrder:boolean = false;
    private guayaoModel = false;
    private tran: TranslatePipe

    //GuaNameOptions: Array<Object>;
    GuaOptions: tyoption
    GuaOrderText: string;
    ActiveYao = 0;

    bengua: string;
    biangua: string;

    Symbols = ['shaoyin.svg', 'shaoyan.svg', 'laoyin.svg', 'laoyan.svg', 'empty.svg']
    SetedYaos = [4, 4, 4, 4, 4, 4]

    //private static guaNamesShang:Array<Object>;
    //private static guaNamesGong:Array<Object>;
    
    glsetting:GlobalSetting;
    constructor(@Inject(GlobalSetting) glsetting:GlobalSetting, elementRef: ElementRef) {
        this.glsetting = glsetting;
        this.rootElement = elementRef;
        this.tran = new TranslatePipe;
    }
    
    get Result(){
        if(this.GuayaoModel == true){
            return this.convertYaoToName();
        }else{
            // let useTW = false
            // this.bengua = this.tran.transform(this.bengua, [useTW])
            // this.biangua = this.tran.transform(this.biangua, [useTW])
            return [this.bengua, this.biangua]
        }
    }
    
    get GuaGongOrder() {
        return this.guagongOrder;
    }

    set GuaGongOrder(value:boolean) {
        this.guagongOrder = value;
        this.initGuaNames(value);
        this.GuaOrderText = value ? '按卦宫排序' : '按上卦排序';
        this.showAnimate('paigua-guachi', 'paigua-guachi');
    }
    
    get GuayaoModel(){
        return this.guayaoModel;
    }
    
    set GuayaoModel(value){
        this.guayaoModel = value;
        if(value == true){
            this.showAnimate('paigua-yao-name', 'paigua-yao-symb');
        }else{
            this.showAnimate('paigua-yao-symb', 'paigua-yao-name');
        }
    }
    
    ngOnInit(){
        let domGuaName = jQuery('#paigua-yao-name')
        this.GuaGongOrder = domGuaName.hasClass('guagong') ? true : false;
        this.guayaoModel = domGuaName.hasClass('hidden') ? true : false;

        if(this.GuayaoModel === true){

        }else{
            this.bengua = '坤为地'
            this.biangua = '坤为地'
        }

        jQuery(this.rootElement.nativeElement)
            .find('.paigua.help')
            .popup({
                on:'click',
                position : 'bottom left'
            });
    }
    
    initGuaNames(guagong:boolean) {
        if (guagong === false) {
            this.initGuaNamesShang();
        } else {
            this.initGuaNamesGong();
        }
    }
    
    private initGuaNamesShang(){
        this.GuaOptions = {Groups: []}

        for (let s = 0; s < 8; s++) {
            let gua = Gua64(s * 8 + s);

            let gp = {Name: '上卦 - ' + gua.Shang.Name, Items: []}
            this.GuaOptions.Groups.push(gp)
            for (let x = 0; x < 8; x++) {
                let gua = Gua64(s * 8 + x);
                gp.Items.push({Value: gua.Name, Text: gua.Name});
            }
        }
    }

    private initGuaNamesGong(){
        this.GuaOptions = {Groups: []}
        var pattern = [1, 2, 4, 8, 16, 8, 7];

        for (var idx = 0; idx < 8; idx++){
            var guaIndex = idx + idx * 8;
            var mainGua = Gua64(guaIndex);

            let gp = {Name: '卦宫 - ' + mainGua.Shang.Name, Items: []}
            this.GuaOptions.Groups.push(gp)
            gp.Items.push({Value: mainGua.Name, Text: mainGua.Name})

            for (var p = 0; p < pattern.length; p++) {
                guaIndex = guaIndex ^ pattern[p];
                var gua = Gua64(guaIndex);
                gp.Items.push({Value: gua.Name, Text: gua.Name});
            };
        }

        console.log(this.GuaOptions)
    }
    
    private showAnimate(outId: string, inId: string){
        //jQuery('.paigua.time').transition('fade down flip');
        jQuery('#' + outId).transition('fade left', function(){
            jQuery('#' + inId).transition('fade right');
        });
    }

    private convertYaoToName(){
        let notset = this.SetedYaos.filter(y => y == 4)
        if(notset.length > 0){
            return {error: '六个爻位必须都赋值才能排卦!'}
        }

        let benText = ''
        let bianText = ''
        for(let idx = 5; idx >= 0; idx--){
            benText += (this.SetedYaos[idx] % 2);
            bianText += this.SetedYaos[idx] > 1 ? ((this.SetedYaos[idx] + 1) % 2) : (this.SetedYaos[idx] % 2)
        }

        let beni = parseInt(benText, 2)
        let biani = parseInt(bianText, 2)

        let bengua = Gua64(beni);
        let biangua = Gua64(biani);

        return [bengua.Name, biangua.Name]
    }
}