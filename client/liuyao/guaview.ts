/// <reference path="../../typings/angular2-meteor.d.ts" />
/// <reference path="../../typings/book.d.ts" />

import {Component, Inject, Input, NgFor, ElementRef, AfterViewInit} from 'angular2/angular2'

import {TranslatePipe} from 'client/allgemein/translatePipe'
import {GlobalSetting} from  'client/globalsetting'

import {Gua} from "../../lib/base/gua";
import {GanZhi} from "../../lib/base/ganzhi";

declare var jQuery:any;

@Component({
    selector: 'guaview',
    templateUrl: 'client/liuyao/guaview.html',
    pipes: [TranslatePipe],
    directives: [NgFor]
})

export class GuaView{
    private static types = ['手工排卦', '月日卦', '日时卦', '随机卦']
    private static imgs = ['shaoyin.svg', 'shaoyan.svg', 'laoyin.svg', 'laoyan.svg']

    title = ''
    Info = {
        question: '',
        time: '',
        type: ''
    }
    Gua: Gua;
    shenshaColumnCount = 5;
    simpleShow = 'f';

    @Input() initdata:string

    private fuyaos: Array<Object>;
    private benyaos: Array<Object>;
    private bianyaos: Array<Object>;
    private shiying: Array<string>;

    private translate = new TranslatePipe();

    glsetting: GlobalSetting;
    constructor(@Inject(GlobalSetting) glsetting: GlobalSetting,
                private rootElement: ElementRef){
        this.glsetting = glsetting;
    }

    get Yue(){
        return this.Gua.Yue;
    }

    get Ri(){
        return this.Gua.Ri;
    }

    get GuaGong(){
        return this.Gua.Ben.GuaGong;
    }

    get HasBianGua(){
        return this.Gua.Ben != this.Gua.Bian;
    }

    get Bengua(){
        let text = this.Gua.Ben.Name;
        let prop = this.Gua.Ben.Property;
        if(prop != ''){
            text += '【' + prop + '】'
        }

        let res = {
            title: this.tran(this.Gua.Ben.GuaGong),
            text: text,
            content: this.tran(this.Gua.Ben.Mean)
        }

        return res;
    }

    get Biangua(){
        if(this.Gua.Ben === this.Gua.Bian){
            return {title: '', text: '', content: ''}
        }

        let text = this.Gua.Bian.Name;
        let prop = this.Gua.Bian.Property;
        if(prop != ''){
            text += '【' + prop + '】'
        }

        let res = {
            title: this.tran(this.Gua.Bian.GuaGong),
            text: text,
            content: this.tran(this.Gua.Bian.Mean)
        }

        return res;
    }

    get ShenShas(){
        let column = this.shenshaColumnCount;
        let row = Math.ceil(14 / column)

        let res = [];
        for(let r = 0; r < row; r++){
            let rowCollection = [];
            res.push(rowCollection)

            for(let c = 0; c < column; c++){
                if(r * column + c >= this.Gua.ShenShas.length - 1){
                    rowCollection.push('')
                }else{
                    let ss = this.Gua.ShenShas[r * column + c];
                    rowCollection.push('[' + ss.Name + ' - ' + ss.Result.join('') + ']')
                }
            }
        }

        return res;
    }

    get Shen6(){
        /*let res = []
         for(let idx = 5; idx >= 0; idx--){
         res.push(this.Gua.Shen6[idx]);
         }

         return res;*/

        return this.Gua.Shen6;
    }

    get Fuyaos(){
        if(this.fuyaos && this.fuyaos[0]['simple'] == this.simpleShow) {
            return this.fuyaos;
        }

        this.fuyaos = new Array<Object>();

        let wxbase = this.Gua.Ben.WuXing;
        let gz = this.Gua.FuGua.GanZhis;
        let gzBen = this.Gua.Ben.GanZhis;

        for(let i = 0; i < 6; i++){
            if(gz[i].Index == gzBen[i].Index){
                this.fuyaos.push({Text: '\u00A0', info: ' '})
                continue;
            }

            let zhi = gz[i].Zhi.Name;
            let wx = gz[i].Zhi.WuXing.Name
            let shen = gz[i].Zhi.WuXing.Ref(wxbase);

            let obj = {
                Text: this.simpleShow == 's' ? shen[1] + zhi : shen[0] + zhi + wx,
                info: this.tran(gz[i].Name + ' —— ' + gz[i].NaYin)
            }

            this.fuyaos.push(obj)
        }

        this.fuyaos[0]['simple'] = this.simpleShow
        return this.fuyaos;
    }

    get Benyaos(){
        if(this.benyaos && this.benyaos[0]['simple'] == this.simpleShow) {
            return this.benyaos;
        }

        this.benyaos = new Array<Object>();

        let wxbase = this.Gua.Ben.WuXing;
        let gz = this.Gua.Ben.GanZhis;
        let yaos = this.Gua.Benyaos;

        let shiyao = this.Gua.Ben.Shiyao
        let yinyao = (shiyao + 3) % 6

        for(let i = 0; i < 6; i++){
            let zhi = gz[i].Zhi.Name;
            let wx = gz[i].Zhi.WuXing.Name
            let shen = gz[i].Zhi.WuXing.Ref(wxbase);

            let txt = ''
            if(shiyao == i){
                txt += '世'
            }else  if(yinyao == i){
                txt += '应'
            }

            let obj = {
                Text: this.simpleShow == 's' ? shen[1] + zhi : shen[0] + zhi + wx,
                Shen: shen[0],
                Img: GuaView.imgs[yaos[i]],
                ShiYing: txt,
                info: this.tran(gz[i].Name + ' —— ' + gz[i].NaYin)
            }

            this.benyaos.push(obj)
        }

        this.benyaos[0]['simple'] = this.simpleShow
        return this.benyaos;
    }

    get Bianyaos(){
        if(this.bianyaos && this.bianyaos[0]['simple'] == this.simpleShow) {
            return this.bianyaos;
        }

        this.bianyaos = new Array<Object>();

        let wxbase = this.Gua.Bian.WuXing;
        let gz = this.Gua.Bian.GanZhis;
        let yaos = this.Gua.Bianyaos;

        for(let i = 0; i < 6; i++){

            let zhi = gz[i].Zhi.Name;
            let wx = gz[i].Zhi.WuXing.Name
            let shen = gz[i].Zhi.WuXing.Ref(wxbase);

            let obj = {
                Text: this.simpleShow == 's' ? shen[1] + zhi : shen[0] + zhi + wx,
                Shen: shen[0],
                Img: GuaView.imgs[yaos[i]],
                info: this.tran(gz[i].Name + ' —— ' + gz[i].NaYin)
            }

            this.bianyaos.push(obj)
        }

        this.bianyaos[0]['simple'] = this.simpleShow
        return this.bianyaos;
    }

    get ShiYing(){
        if(this.shiying) return this.shiying;

        this.shiying = new Array<string>();
        let shiyao = this.Gua.Ben.Shiyao
        let yinyao = (shiyao + 3) % 6

        let yaos = this.Gua.Benyaos;

        for(let i = 0; i < 6; i++){
            /*let txt = ''

            if(yaos[i] > 1){
                txt += '—>'
            }*/

            let txt = yaos[i] > 1 ? 'arrow.svg' : 'empty.svg'

            this.shiying.push(txt)
        }

        return this.shiying;
    }

    GetShenSha(name: string): string{
        let xk = this.Gua.ShenShas.filter(ss => ss.Name == name)
        if(xk.length > 0){
            return xk[0].Result.join('')
        }else{
            return '';
        }
    }

    showSetting() {
        jQuery(this.rootElement.nativeElement)
            .find('.gua.setting')
            .transition('fade up', 1000)
    }

    onInit(){
        let params = JSON.parse(this.initdata)

        this.onInitParse(params);
        this.onInitBaseInfo(params);

        let ben = params['gua'][0]
        let bian = params['gua'][1]
        if(Array.isArray(params['time'])){
            let riyue = params['time'];
            this.Info.time = `${riyue[0]}月 ${riyue[1]}日`
            this.Gua = new Gua(null, riyue[0], riyue[1], ben, bian)
        }else{
            let time = new Date(params['time'])
            this.Info.time = `${time.getFullYear()}年
                               ${time.getMonth() + 1}月
                               ${time.getDate()}日
                               ${time.getHours()}时
                               ${time.getMinutes()}分`
            this.Gua = new Gua(time, null, null, ben, bian)
        }

        this.shenshaColumnCount = this.glsetting.GetSetting('gua-shensha')
    }

    afterViewInit(){
        jQuery(this.rootElement.nativeElement).find('.accordion.question').accordion()
        jQuery(this.rootElement.nativeElement).find('.gua.mean').popup({on: 'click'})

        /*let dom = jQuery(this.rootElement.nativeElement)
        setTimeout(function(){
            dom.find('.gua.mean').popup({on: 'click'})
        }, 2000);*/
    }
    
    exportAsRecord(): YiRecord{
        let ques = this.Info.question;
        if(!ques || ques == ''){
            ques = '问念'
        }
        
        let params = JSON.parse(this.initdata)

        return {
            gua: {
                time: new Date(params['time']),
                yueri: [this.Gua.Yue.Name, this.Gua.Ri.Name],
                ben: this.Gua.Ben.Name,
                bian: this.Gua.Bian.Name
            },
            question: ques,
            description: '',
            owner: null,
            feedback: false,
            created: Date.now(),
            modified: Date.now(),
        }
    }

    private tran(txt): string{
        return this.translate.transform(txt, [this.glsetting.lang])
    }

    private onInitParse(params: Object){
        if(typeof params['time'] == 'string'){
            if(params['time'].indexOf(',') > 0){
                let items = params['time'].split(',')
                params['time'] = items;
            } else {
                let date = new Date(params['time'])
                date.getMinutes()
                params['time'] = date;
            }
        }

        if(typeof params['gua'] == 'string'){
            let items = params['gua'].split(',')
            params['gua'] = items;
        }
    }

    private onInitBaseInfo(params: Object){
        this.title = params['gua'][0] == params['gua'][1] ? params['gua'][0]
            : params['gua'][0] + ' 之 ' + params['gua'][1]

        this.Info.question = params['question'] ? params['question'] : ''
        this.Info.type = GuaView.types[parseInt(params['type'])]
    }
}