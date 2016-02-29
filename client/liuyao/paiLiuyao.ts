/// <reference path="../../typings/angular2-meteor.d.ts" />

import {Component, Inject} from 'angular2/core'
import {NgFor} from 'angular2/common'
import {Router} from 'angular2/router'

import {PaipanEmitter} from 'client/allgemein/paipanermitter'
import {TranslatePipe} from 'client/allgemein/translatePipe'
import {GlobalSetting} from  'client/globalsetting'
import {GanZhi, ZhiNames} from "../../lib/base/ganzhi";
import {Gua64} from "../../lib/base/gua"

import {PailiuyaoTime} from './paipan/pailiuyaotime';
import {PaiLiuyaoGua} from './paipan/pailiuyaogua';
import {PailiuyaoLeading} from './paipan/leading'
import {LeadingYao} from './paipan/leadingyaos'
import {PailiuyaoCoins} from './paipan/coins'

declare var jQuery:any;

@Component({
    selector: 'pailiuyao',
    pipes: [TranslatePipe],
    templateUrl: 'client/liuyao/paiLiuyao.html',
    directives: [NgFor, PailiuyaoTime, PaiLiuyaoGua, PailiuyaoLeading, LeadingYao, PailiuyaoCoins]
})

export class PaiLiuyao {
    emitter = PaipanEmitter.get(PaipanEmitter.Paipan);
    
    inputModel:string = 'manuel';
    question: string;

    private router: Router;
    glsetting:GlobalSetting;
    constructor(@Inject(GlobalSetting) glsetting:GlobalSetting, router: Router) {
        this.glsetting = glsetting;
        this.router = router;
    }
    
    get InputModel(){
        return this.inputModel;
    }
    
    set InputModel(value){
        this.inputModel  = value
    }

    showMenu(hide) {
        if(hide === true){
            jQuery(document).find('.ui.labeled.sidebar').sidebar('hide')
        }else{
            jQuery(document).find('.ui.labeled.sidebar').sidebar('toggle');
        }
    }

    ngOnInit() {
        this.question = ''
        let hideMenu = true;
        this.showMenu(hideMenu);
    }
    
    navToLeading(){
        this.router.parent.navigate(['./Leading'])
    }

    paiGua(time, gua){
        if(gua.error){
            this.glsetting.Notify(gua.error, -1)
            return
        }

        let params = {
            flag: 'gua',
        }

        if(this.InputModel == 'manuel'){
            params['time'] = time;
            params['gua'] = gua;
            params['type'] = 0;
            params['question'] = this.question
        }else if(this.InputModel == 'auto'){
            let date = new Date(Date.now());
            params['time'] = date.toISOString();
            params['type'] = gua;
            params['gua'] = gua === 3 ? this.calcRandomGua() : this.calcRiYueGua(gua);
            params['question'] = this.question
        }

        //this.router.parent.navigate(['/Desktop', params])
        this.emitter.emit(params)
    }

    // 1 日月卦 2 日时卦
    private calcRiYueGua(type: number){
        var d = new Date(Date.now());

        // 日月卦
        var shang = (d.getFullYear() + d.getMonth() + d.getDay()) % 8;
        var xia = (d.getMonth() + d.getDay()) % 8;
        var tmp = 1 << (d.getDate() + d.getHours()) % 6;

        // 日时卦
        if (type === 2) {
            shang = (d.getMonth() + d.getDay() + d.getHours()) % 8;
            xia = (d.getDay() + d.getHours()) % 8;
            tmp = 1 << d.getHours() % 6;
        };

        var beni = shang * 8 + xia;
        var biani = beni ^ tmp;

        let bengua = Gua64(beni);
        let biangua = Gua64(biani);

        return [bengua.Name, biangua.Name];
    }

    // 3 随机卦
    private calcRandomGua(){
        let res = ["", ""];
        for (let idx = 0; idx < 6; idx++) {
            let i = Math.floor((Math.random() * 8) + 1);
            if (i >= 1 && i <= 3) {
                res[0] += "0";
                res[1] += "0";
            } else if (i >= 4 && i <= 6) {
                res[0] += "1";
                res[1] += "1";
            } else if (i == 7) {
                res[0] += "0";
                res[1] += "1";
            } else if (i == 8) {
                res[0] += "1";
                res[1] += "0";
            }
        }

        let beni = parseInt(res[0], 2)
        let biani = parseInt(res[1], 2)

        let bengua = Gua64(beni);
        let biangua = Gua64(biani);

        return [bengua.Name, biangua.Name];
    }
}