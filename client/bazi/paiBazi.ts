/// <reference path="../../typings/angular2-meteor.d.ts" />
/// <reference path="../../typings/moment-node.d.ts" />
/// <reference path="../../typings/global.d.ts" />

import {Component, Inject, ElementRef} from 'angular2/core'
import {NgFor} from 'angular2/common'
import {Router} from 'angular2/router'

import {PaipanEmitter} from 'client/allgemein/paipanermitter'
import {TranslatePipe} from 'client/allgemein/translatePipe'
import {GlobalSetting} from  'client/globalsetting'

import {LandMaps} from "../../lib/lunar/landmaps";
import {GanZhi} from '../../lib/base/ganzhi'
import {TYLunar, TYDate} from '../../lib/lunar/tylunar'

import {SemanticSelect, tyoption} from 'client/allgemein/directives/smselect'

declare var jQuery:any;
declare var moment;

@Component({
    selector: 'paibazi',
    templateUrl: 'client/bazi/paiBazi.html',
    pipes:[TranslatePipe],
    directives: [NgFor, SemanticSelect]
})

export class PaiBazi{
    emitter = PaipanEmitter.get(PaipanEmitter.Paipan);
    
    private gongliModel = true
    private ganzhinames: tyoption;

    Panel = 'paipan';

    solarinfo = '';
    maps: Array<Object>;
    cities: Array<Object>;
    LandOptions: tyoption
    CityOptions: tyoption
    monthCollection: tyoption;
    timeCollection: tyoption;

    Input = {
        Name: '',
        Gender: 'm',
        Land: '',
        City: '',
        Date: '',
        Time: '',
        HH: 0,
        MM: 0,
        Solar: true,
        Code: ''
    }
    CalcSet = {
        Y: '',
        M: '丙寅',
        D: '',
        T: '甲子',
        y: '',
        d: '',
        currentYear: 2015,
        Result: null,
        ResultTx: ''
     }

    NlSearch:Object;

    glsetting:GlobalSetting;
    constructor(@Inject(GlobalSetting) glsetting:GlobalSetting,
                private router: Router, 
                private rootElement: ElementRef) {
        this.glsetting = glsetting;
    }
    
    showMenu(hide){
        if(hide === true){
            jQuery(document).find('.ui.labeled.sidebar').sidebar('hide')
        }else{
            jQuery(document).find('.ui.labeled.sidebar').sidebar('toggle');
        }
    }

    get Land(){
        return this.Input.Land;
    }

    set Land(value){
        if(value != this.Input.Land){
            this.Input.Land = value;
            this.initCityOptions();
        }
    }

    get City(){
        return this.Input.City;
    }

    set City(value){
        this.Input.City = value;
        let city = this.cities.filter(c => c['Name'] == value);
        if(city.length == 1){
            this.Input.Code = city[0]['Code']
            this.initSolarInfo();
        }
    }

    get Solar(){
        return this.Input.Solar;
    }

    set Solar(value){
        this.Input.Solar = value;
        this.initSolarInfo();
    }

    get GanZhiNames() {
        if(!this.ganzhinames){
            //this.ganzhinames = [].concat(GanZhi.GanZhiNames);
            this.ganzhinames = {Items: []}
            this.ganzhinames.Items = GanZhi.GanZhiNames.map(gz => {
                return {Value: gz, Text: gz}
            })
        }

        return this.ganzhinames
    }

    get GanZhiNamesM(){
        if(this.CalcSet.y != this.CalcSet.Y || !this.monthCollection){
            this.monthCollection = {Items: []}
            this.monthCollection.Items = this.qiganzhi(this.CalcSet.Y, true).map(
                gz => {
                    return {Value: gz, Text: gz}
                }
            );

            this.CalcSet.y = this.CalcSet.Y;

            /*setTimeout(() => {
                this.CalcSet.M = this.monthCollection[0]
            }, 500)*/
        }

        return this.monthCollection;
    }

    get GanZhiNamesT(){
        if(this.CalcSet.d != this.CalcSet.D || !this.timeCollection){
            this.timeCollection = {Items: []}
            this.timeCollection.Items = this.qiganzhi(this.CalcSet.D, false).map(
                gz => {
                    return {Value: gz, Text: gz}
                }
            );

            this.CalcSet.d = this.CalcSet.D;
            /*setTimeout(() => {
                this.CalcSet.T = this.timeCollection[0]
            }, 500)*/
        }

        return this.timeCollection;
    }
    
    get TimeModel(){
        return this.gongliModel;
    }
    
    set TimeModel(value){
        this.gongliModel = value;
        if(value == true){
            this.showAnimate('bazi-time-nl', 'bazi-time-gl');
        }else{
            this.showAnimate('bazi-time-gl', 'bazi-time-nl');
        }
    }
    
    ngOnInit(){
        let hideMenu = true;
        this.showMenu(hideMenu);

        this.maps = LandMaps.Maps;
        this.LandOptions = {Items:[]}
        this.LandOptions.Items = this.maps.map(l => {
            return {Value: l['Name'], Text: l['Name']}
        })

        this.Land = this.maps[0]['Name']

        let time = new Date(Date.now())
        this.Input.Date = time.formate('date');
        this.Input.HH = time.getHours();
        this.Input.MM = time.getMinutes();

        this.Solar = true;
        this.CalcSet.Y = '甲子';
        this.CalcSet.D = '甲子';
        this.CalcSet.currentYear = (new Date(Date.now())).getFullYear();
        
        //let tydate = new TYDate(time)
        this.NlSearch={
            Year: time.getFullYear(),
            MonthOptions:TYLunar.M_ChineseMonthNames.join('月 '),
            DateOptions: TYLunar.M_DayNames.join(' '),
            Month: 0,
            Date: 0,
            Leap: false,
        }
    }

    ngAfterViewInit(){
    }

    calcNextTime(direction: number){
        let date = this.calcTimeFromGanzhi(direction)
        this.CalcSet.Result = date;
        this.CalcSet.ResultTx = date ? date.toChinaString(true) : '找不到相应的日子'
    }

    setBaziTime(){
        let date = this.CalcSet.Result
        this.Input.Date = date.formate('date');
        this.Input.HH = date.getHours();
        this.Input.MM = date.getMinutes();
        this.Panel = 'paipan'
    }

    paiBazi(){
        let date = new Date(this.Input.Date)
        if(this.TimeModel == false){
            // 农历时间
            date = this.searchNL()
            if(!date){
                this.glsetting.Notify('找不到指定的农历日期！', -1)
                return
            }
        }
        
        let houres = this.Input.HH;
        let minutes = this.Input.MM;

        let birthday = new Date(date.getFullYear(), date.getMonth(), date.getDate(), houres, minutes)
        let params = {
            flag: 'bazi',
            name: this.Input.Name == '' ? '未知' : this.Input.Name,
            birthday: birthday.formate('datetime'),
            gender: this.Input.Gender,
            solar: this.Input.Solar,
            land: this.Input.Land,
            city: this.Input.City == '未知' ? '' : this.Input.City,
            code: this.Input.Code
        }

        //this.router.parent.navigate(['/Desktop', params])
        this.emitter.emit(params)
    }
    
    private searchNL(){
        var y = this.NlSearch['Year'];
        var m = parseInt(this.NlSearch['Month'].toString()) + 1
        var d = parseInt(this.NlSearch['Date'].toString()) + 1
        var leap = '';
        if(this.NlSearch['Leap'] === true){
            m = m * (-1);
            leap = '闰'
        }

        let res = TYLunar.SearchNongli(y, m, d);
        return res
    }

    private initCityOptions(){
        let res = this.maps.filter(l => l['Name'] == this.Input.Land);
        this.cities = res[0]['Cities']
        this.City = this.cities[0]['Name']

        this.CityOptions = {Items: []}
        this.CityOptions.Items = this.cities.map(c => {
            return {Value: c['Name'], Text: c['Name']}
        })
    }

    private initSolarInfo(){
        if(this.Input.Solar == false || this.Input.City == '' || this.Input.Land == '未知'){
            this.solarinfo = '';
        }else{
            let timeoff = LandMaps.CalcTimeOff(this.Input.Code)
            let dire = timeoff > 0 ? '提前' : '推迟'
            timeoff = Math.abs(timeoff)
            this.solarinfo = ` (比北京时间${dire} ${timeoff} 分钟)`
        }
    }

    // 根据年或者日干支起月和时干支
    private qiganzhi(gztext: string, yue: boolean){
        let off = yue ? 2 : 0;
        var gz = new GanZhi(gztext);
        var start = (gz.Gan.Index % 5) * 2;
        start = (start + off) % 10;
        var res = [];
        for (var idx = 0; idx < 12; idx++) {
            var gan = (start + idx) % 10;
            var zhi = (idx + off) % 12;

            let tmp = new GanZhi([gan, zhi])
            res.push(tmp.Name);
        }

        return res;
    }

    // 根据年干支计算公历年
    private calcYearFromGanzhi(startYear: number, ganzhi: GanZhi, direktion: number): number{
        var year = startYear - 1984;
        while (year < 0) {
            year += 60;
        }

        var gan = ((year % 60) % 10);
        var zhi = ((year % 60) % 12);

        var gz = new GanZhi([gan, zhi]);
        var jiaziIndex = gz.Index;
        var zielIndex = ganzhi.Index;

        var yearDiff = zielIndex - jiaziIndex;
        yearDiff = direktion > 0 ? (yearDiff + 60) % 60 : ((60 - yearDiff) % 60) * -1;
        var result = startYear + yearDiff;
        return result;

        var result = -1;
        for (var idx = 0; idx < 60; idx++) {
            if (jiaziIndex == zielIndex) {
                result = year - idx + 1984;
                break;
            }

            jiaziIndex = (jiaziIndex - 1 + 60) % 60;
        }

        if (direktion < 0) {
            while (result > startYear) {
                result -= 60;
            };
        } else {
            while (result < startYear) {
                result += 60;
            };
        };


        return result;
    }

    private calcTimeFromGanzhi(direction: number): Date{
         var bazi = {
             Y: new GanZhi(this.CalcSet.Y),
             M: new GanZhi(this.CalcSet.M),
             D: new GanZhi(this.CalcSet.D),
             T: new GanZhi(this.CalcSet.T),
         }

         // 确定年和月份。寅月从2月开始，寅的地支下标正好是2
         var month = bazi.M.Zhi.Index == 0 ? 12 : bazi.M.Zhi.Index;
         var year = this.calcYearFromGanzhi(this.CalcSet.currentYear + direction, bazi.Y, direction);

         //丑月跨年
         year += (bazi.M.Zhi.Name == "丑") ? 1 : 0;

         var baziIndex = [bazi.Y.Index, bazi.M.Index, bazi.D.Index, bazi.T.Index];
         var found: Date = null;
         while (year > 0 || year < 3000) {
             var beginDate = TYLunar.getSolarTerms(year, month)[0];
             var date = new Date(beginDate.getFullYear(), beginDate.getMonth(), beginDate.getDate(), 0, 0, 0);

             var baziTmp = TYLunar.calcBazi(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes());
             var dateDiff = bazi.D.Index - baziTmp['D'].Index;
             dateDiff = (dateDiff + 60) % 60;
             date = TYLunar.addDays(dateDiff, date);

             baziTmp = TYLunar.calcBazi(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes());
             if (baziTmp['Y'].Index == bazi.Y.Index &&
                 baziTmp['M'].Index == bazi.M.Index &&
                 baziTmp['D'].Index == bazi.D.Index) {
                 found = date;
                 break;
             } else {
                 year += direction * 60;
             };
         };

         if(found != null){
             this.CalcSet.currentYear = found.getFullYear();
             let hours = (bazi.T.Index % 12) * 2;
             let res = new Date(found.getTime() + hours * 60 * 60 * 1000)
             return res;
         }else{
             return null;
         }
     }
     
    private showAnimate(outId: string, inId: string){
        jQuery(this.rootElement.nativeElement).find('#' + outId).transition('fade left', () => {
            jQuery(this.rootElement.nativeElement).find('#' + inId).transition('fade right');
            //jQuery('#' + inId).transition('fade right');
        });
    }
}