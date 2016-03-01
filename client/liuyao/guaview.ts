/// <reference path="../../typings/angular2-meteor.d.ts" />
/// <reference path="../../typings/book.d.ts" />

import {Component, Inject, Input, ElementRef, AfterViewInit, NgZone} from 'angular2/core'
import {NgFor} from 'angular2/common'

import {TranslatePipe} from 'client/allgemein/translatePipe'
import {GlobalSetting} from  'client/globalsetting'

import {Gua} from "../../lib/base/gua";
import {GanZhi, Zhi} from "../../lib/base/ganzhi";
import {TYDate} from '../../lib/lunar/tylunar'

import {SemanticSelect} from 'client/allgemein/directives/smselect'

declare var jQuery:any;

@Component({
    selector: 'guaview',
    templateUrl: 'client/liuyao/guaview.html',
    pipes: [TranslatePipe],
    directives: [NgFor, SemanticSelect],
    styles: [`
        .ui.table{
            border-color: transparent;
        }
        
        table, tr {
           border-collapse: collapse;
           border-style: collapse;
        }
    `]
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
    showArrow = true

    @Input() initdata:string
    Tips: string;

    private fuyaos: Array<guayao>;
    private benyaos: Array<guayao>;
    private bianyaos: Array<guayao>;
    private shiying: Array<string>;
    private shenshas: Array<Object>;
    private yue: {name: string, color: string, index: number}
    private ri: {name: string, color: string, index: number}
    private xunkong: Array<{name: string, color: string, index: number}>

    private translate = new TranslatePipe();

    constructor(@Inject(GlobalSetting) public glsetting: GlobalSetting,
                private rootElement: ElementRef,
                private ngZone: NgZone){
        this.showArrow = this.glsetting.GetSetting('gua-arrow')
    }

    get Yue(){
        this.yue = (this.yue || {name: this.Gua.Yue.Name, color: 'black', index: this.Gua.Yue.Index})
        return this.yue
    }

    get Ri(){
        this.ri = (this.ri || {name: this.Gua.Ri.Name, color: 'black', index: this.Gua.Ri.Index})
        return this.ri
    }

    get GuaGong(){
        return this.Gua.Ben.GuaGong;
    }

    get HasBianGua(){
        return this.Gua.Ben != this.Gua.Bian;
    }

    get Bengua(){
        let text = this.Gua.Ben.Name;
        //text = text.length < 4 ? text : text.substring(2)
        let prop = this.Gua.Ben.Property;
        if(prop != ''){
            text += ' [' + prop + ']'
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
        //text = text.length < 4 ? text : text.substring(2)
        let prop = this.Gua.Bian.Property;
        if(prop != ''){
            text += ' [' + prop + ']'
        }

        let res = {
            title: this.tran(this.Gua.Bian.GuaGong),
            text: text,
            content: this.tran(this.Gua.Bian.Mean)
        }

        return res;
    }

    get ShenShas(){
        if(this.shenshas &&
            this.shenshas[0]['length'] == this.shenshaColumnCount) {
            return this.shenshas
        }

        let column = this.shenshaColumnCount;
        let row = Math.ceil(14 / column)

        let res = [];
        for(let r = 0; r < row; r++){
            let rowCollection = [];
            res.push(rowCollection)

            for(let c = 0; c < column; c++){
                if(r * column + c >= this.Gua.ShenShas.length - 1){
                    rowCollection.push({name: null, text: ['', ''], index: [-1, -1]})
                }else{
                    let ss = this.Gua.ShenShas[r * column + c];
                    let zhis = ss.Result.map(z => Zhi(z))
                    let count = zhis.length

                    let disObj = {
                        //name: '[' + ss.Name + ' - ' + ss.Result.join('') + ']',
                        name: ss.Name,
                        text: [zhis[0].Name, count == 1 ? '' : zhis[1].Name],
                        index: [zhis[0].Index, count == 1 ? -1 : zhis[1].Index],
                        color: ['black', 'black'],
                        wide: count == 2 ? 2 : 1
                    }

                    rowCollection.push(disObj)
                }
            }
        }

        this.shenshas = res;
        return this.shenshas;
    }

    get Shen6(){
        if(this.simpleShow == 's'){
            let res = this.Gua.Shen6.map(s => {return s.substr(0, 1)})
            return res;
        }else {
            return this.Gua.Shen6;
        }
    }

    get Fuyaos(){
        if(this.fuyaos && this.fuyaos[0]['simple'] == this.simpleShow) {
            return this.fuyaos;
        }

        this.fuyaos = [];

        let wxbase = this.Gua.Ben.WuXing;
        let gz = this.Gua.FuGua.GanZhis;
        let gzBen = this.Gua.Ben.GanZhis;

        for(let i = 0; i < 6; i++){
            if(gz[i].Index == gzBen[i].Index){
                this.fuyaos.push({Text: '\u00A0', info: ' ', index: -1, color: ''})
                continue;
            }

            let zhi = gz[i].Zhi.Name;
            let wx = gz[i].Zhi.WuXing.Name
            let shen = gz[i].Zhi.WuXing.Ref(wxbase);

            let obj = {
                Text: this.simpleShow == 's' ? shen[1] + zhi : shen[0] + zhi + wx,
                info: this.tran(gz[i].Name + ' —— ' + gz[i].NaYin),
                index: gz[i].Zhi.Index,
                color: 'lightgrey'
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

        this.benyaos = [];

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
                info: this.tran(gz[i].Name + ' —— ' + gz[i].NaYin),
                index: gz[i].Zhi.Index,
                color: 'black'
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

        this.bianyaos = [];

        let wxbase = this.Gua.Ben.WuXing;
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
                info: this.tran(gz[i].Name + ' —— ' + gz[i].NaYin),
                index: gz[i].Zhi.Index,
                color: 'black'
            }

            this.bianyaos.push(obj)
        }

        this.bianyaos[0]['simple'] = this.simpleShow
        return this.bianyaos;
    }

    get ShiYing(){
        if(this.shiying) return this.shiying;

        this.shiying = [];
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

    get XunKong(){
        if(!this.xunkong){
            let xks = this.Gua.ShenShas.filter(ss => ss.Name == '旬空')
            let zhis = xks[0].Result.map(z => Zhi(z))
            this.xunkong = []
            for(let z of zhis){
                this.xunkong.push({
                    name: z.Name,
                    color: 'black',
                    index: z.Index
                })
            }
        }

        return this.xunkong
    }

    showSetting() {
        jQuery(this.rootElement.nativeElement)
            .find('.gua.setting')
            .transition('fade up', 1000)
    }

    changeQuestion(txt: string){
        this.Info.question = txt;
    }
    
    caigua(index){
        let chong = (x, y) => {
            return ((x - y + 12) % 12) == 6
        }
        
        let he = (x, y) => {
            return ((x + y) == 13) || ((x + y) == 1)
        }

        for(let line of this.ShenShas) {
            for(let ss of line){
                if(ss.name == null)continue

                for (let idx = 0; idx < 2; idx++) {
                    if (index == -1) {
                        ss.color[idx] = 'black'
                    } else if (chong(ss.index[idx], index) == true) {
                        ss.color[idx] = 'red'
                    } else if (he(ss.index[idx], index) == true) {
                        ss.color[idx] = 'green'
                    } else if (ss.index[idx] == index) {
                        ss.color[idx] = 'blue'
                    } else {
                        ss.color[idx] = 'black'
                    }
                }
            }
        }

        let riyue = [this.Yue, this.Ri].concat(this.XunKong)
        for(let f of riyue){
            if(index == -1){
                f.color = 'black'
            }else if(chong(f.index % 12, index) == true){
                f.color = 'red'
            }else if(he(f.index % 12, index) == true){
                f.color = 'green'
            }else if (f.index % 12 == index){
                f.color = 'blue'
            }else{
                f.color = 'black'
            }
        }
        
        for(let f of this.Fuyaos){
            if(index == -1){
                f.color = 'lightgrey'
            }else if(chong(f.index, index) == true){
                f.color = 'red'
            }else if(he(f.index, index) == true){
                f.color = 'green'
            }else if (f.index == index){
                f.color = 'blue'
            }else{
                f.color = 'lightgrey'
            }
        }
        
        for(let f of this.Benyaos){
            if(index == -1){
                f.color = 'black'
            }else if(chong(f.index, index) == true){
                f.color = 'red'
            }else if(he(f.index, index) == true){
                f.color = 'green'
            }else if (f.index == index){
                f.color = 'blue'
            }else{
                f.color = 'black'
            }
        }
        
        for(let f of this.Bianyaos){
            if(index == -1){
                f.color = 'black'
            }else if(chong(f.index, index) == true){
                f.color = 'red'
            }else if(he(f.index, index) == true){
                f.color = 'green'
            }else if (f.index == index){
                f.color = 'blue'
            }else{
                f.color = 'black'
            }
        }
    }

    ngOnInit(){
        let params: Object;
        if(typeof this.initdata == 'string'){
            params =  JSON.parse(this.initdata)
        }else{
            params =  this.initdata
        }

        this.onInitParse(params);
        this.onInitBaseInfo(params);
        this.simpleShow = this.glsetting.GetSetting('gua-simple') == true ? 's' : 'f'
        this.Tips = ''

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

            let tydate = new TYDate(time)
            if(tydate.JQtime){
                //console.log(tydate.JQtime)
                let items = tydate.JQtime.split(':')
                this.Tips = `提示：当日${items[0]}时${items[1]}分换月令。`
            }
        }

        this.shenshaColumnCount = this.glsetting.GetSetting('gua-shensha')
    }

    ngAfterViewInit(){
        jQuery(this.rootElement.nativeElement).find('.accordion.question').accordion()
        jQuery(this.rootElement.nativeElement).find('.gua.mean').popup({on: 'click'})
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
                bian: this.Gua.Bian.Name,
                type: params['type']
            },
            question: ques,
            description: '',
            owner: null,
            feed: '',
            created: Date.now(),
            modified: Date.now(),
            deleted: false,
            cloud: false
        }
    }

    changeShenShaSetting(value){
        this.shenshaColumnCount = parseInt(value.toString()) + 4
    }

    showInfo(){
        let msg = `<div>点击爻位激活彩卦</div><br>
        <div>点击卦宫恢复颜色</div>`

        this.glsetting.Notify(msg, 1)
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

interface guayao {
    Text: string,
    Shen?: string,
    Img?: string,
    info: string,
    index: number,
    color: string
}