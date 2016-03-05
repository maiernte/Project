
//System.import('lib/lunar/lunar.js')

import {Gan, Zhi, GanZhi} from "../base/ganzhi";

declare var Lunar:any;

var TYJianChu = [];
TYJianChu[0] = {
    Titel: "建日",
    Mean: "健旺之气。",
    Good: "宜祭祀、参官、行军、外出、求财、谒贵、交友、上书。",
    Bad: "忌动土、开仓祀灶、新船下水、兢渡。"
};
TYJianChu[1] = {
    Titel: "除日",
    Mean: "除旧布新之象。",
    Good: "宜除服、疗病、避邪、拆卸、出行、嫁娶。",
    Bad: "忌求官、上任、开张、搬家、探病。"
};
TYJianChu[2] = {
    Titel: "满日",
    Mean: "丰收圆满之意。",
    Good: "宜祈福、祭祀、结亲、开市、交易。扫舍、修置产室、裁衣、出行、入仓、开库、店市、求财、出行、修饰舍宇。",
    Bad: "忌服药、栽种、下葬、移徙、求医疗病、上官赴任。寅申巳亥四个月不宜经商。"
};
TYJianChu[3] = {
    Titel: "平日",
    Mean: "平常无吉凶之日。",
    Good: "一般修屋、求福、外出、求财、嫁娶可用。",
    Bad: "忌开渠、经络。"
};
TYJianChu[4] = {
    Titel: "定日",
    Mean: "定为不动，不动则为死气。",
    Good: "只宜计划、谋定。入学、祈福、裁衣、祭祀、结婚姻、纳采问名、求嗣、纳畜、交易亦可",
    Bad: "诸事不宜，尤忌官司、出行。"
};
TYJianChu[5] = {
    Titel: "执日",
    Mean: "固执之意，执持操守也。",
    Good: "一般宜祈福、祭祀、求子、结婚、立约。司法警察执拿案犯。",
    Bad: "忌搬家、远行、入宅、移居、出行、远回、开库、入仓、出纳货财、新船下水。"
};
TYJianChu[6] = {
    Titel: "破日",
    Mean: "刚旺破败之日。",
    Good: "宜求医、治病、破屋坏垣、服药、破贼。",
    Bad: "万事皆忘，婚姻不谐。不宜多管闲事。忌起工、动土、出行、远回、移徙、新船下水、嫁娶、进人口、祀灶、立契约、纳畜、修作。"
};
TYJianChu[7] = {
    Titel: "危日",
    Mean: "危险之意。",
    Good: "宜祭祀、祈福、纳表进章、结婚、纳采问名、捕捉、安床、交易、立契。",
    Bad: "忌登高、冒险、赌博。"
};
TYJianChu[8] = {
    Titel: "成日",
    Mean: "成功、成就、结果之意。",
    Good: "凡事皆有成。宜祭祀、祈福、入学、裁衣、结婚、纳采、嫁娶、纳表章、交易、立契、求医、修产室、出行、远回、移徙、纳畜。",
    Bad: "忌官司。"
};
TYJianChu[9] = {
    Titel: "收日",
    Mean: "收成之意。",
    Good: "经商开市、外出求财，买屋签约、嫁娶订盟诸事吉利。",
    Bad: "忌开市、安床、安葬、入宅、破土。"
};
TYJianChu[10] = {
    Titel: "开日",
    Mean: "开放、开心之意。",
    Good: "凡事求财、求子、求缘、求职、求名。",
    Bad: "埋葬主大凶。辰戌丑未四个月不宜经商。"
};
TYJianChu[11] = {
    Titel: "毕日",
    Mean: "坚固之意。",
    Good: "最宜埋葬，代表能富贵大吉大利。宜祈福、祭祀、求嗣、交易、立契、修合、补牆塞穴、作厕、安床设帐。",
    Bad: "忌看眼病、求医、问学、外出经商，上任就职。辰戌丑未四个月不宜远回、移徙、动土。"
};

export class TYLunar{
    static OneDay = 1000 * 60 * 60 * 24;
    static BaseDay = new Date(1900, 0, 0);
    static M_DayNames = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十", 
                         "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十", 
                         "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];
    static M_MonthNames = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
    static M_ChineseMonthNames = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
    
    static getLunarObject(date: Date){
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        let d = date.getDate();

        if (Lunar.lun.length == 0 || Lunar.lun.y != y || Lunar.lun.m != m) {
            Lunar.calc2(date.getFullYear(), date.getMonth() + 1, true);
        }

        for (let i = 0; i < Lunar.lun.length; i++) {
            if (Lunar.lun[i].d == d) {
                return Lunar.lun[i];
            }
        }

        return null;
    }
    
    static addDays (daysOffset: number, baseDate: Date): Date {
        var base = baseDate ? baseDate : TYLunar.BaseDay;
        return new Date(base.getTime() + daysOffset * TYLunar.OneDay);
    };
    
    static calcDayDiff (first: Date, second: Date) : number{
        var d1 = new Date(first.getFullYear(), first.getMonth(), first.getDate());
        var d2 = new Date(second.getFullYear(), second.getMonth(), second.getDate());
        return Math.round((d2.getTime() - d1.getTime()) / TYLunar.OneDay);
    };

    // month 下标从1开始
    static getSolarTerms (year: number, month: number): Array<Date>{
        // [0,'小寒'],[1,'大寒'],[2,'立春'],[3,'雨水'],[4,'惊蛰'],[5,'春分'],[6,'清明'],[7,'谷雨'],[8,'立夏']
        // [9,'小满'],[10,'芒种'],[11,'夏至'],[12,'小暑'],[13,'大暑'],[14,'立秋'],[15,'处暑'],[16,'白露'],
        // [17,'秋分'],[18,'寒露'],[19,'霜降'],[20,'立冬'],[21,'小雪'],[22,'大雪'],[23,'冬至'] 
        // solarTermsIndex == 0 为小寒
        var res = [];

        if (Lunar.lun.length == 0 || Lunar.lun.y != year || Lunar.lun.m != month) {
            Lunar.calc2(year, month, true);
        }

        for (var i = 0; i < Lunar.lun.length; i++) {
            if (Lunar.lun[i].jqsj != null && Lunar.lun[i].jqsj != "") {
                var o = Lunar.lun[i];
                var items = o.jqsj.split(':');
                res.push(new Date(year, month - 1, o.d, parseInt(items[0]), parseInt(items[1]), parseInt(items[2])));
            }
        }

        return res;
    };

    static getJianChu(yueZhi, riZhi){
        // 寅月以寅日为建日，卯月以卯日为建日，
        // 當推算出「建日」後，以後跟隨的日支，便繼續配上 除、滿、平、定、執、破、危、成、收、開、閉等十二神
        let yue = new GanZhi(yueZhi);
        let ri = new GanZhi(riZhi);

        var index = (ri.Zhi.Index - yue.Zhi.Index + 12) % 12;
        return TYJianChu[index];
    }

    // m, d分别是月日的下标，从1开始。
    static SearchNongli (y:number, m:number, d:number): Date {
        var dateName = Lunar.rmc[d - 1];
        var yueName = Lunar.ymc[(Math.abs(m) + 1) % 12];
        var leap = m < 0 ? "闰" : "";

        // 如果三个月内都找不到的话就是没有。
        for (var i = 0; i < 3; i++) {
            var month = Math.abs(m) + i;
            var year = month >= 13 ? y + 1 : y;
            month = month >= 13 ? month % 12 : month;

            // 函数 Lunar.calc2() 月份的下标从1开始。
            Lunar.calc2(year, month, true);
            for (var d = 0; d < Lunar.lun.length; d++) {
                var dateObj = Lunar.lun[d];
                if (dateObj.Ldc == dateName &&
                    dateObj.Lmc == yueName &&
                    dateObj.Lleap == leap) {
                    return new Date(dateObj.y, dateObj.m - 1, dateObj.d);
                }
            }
        }

        return null;
    }

    // month 的下标从1开始
    static calcBazi(year: number,
                    month: number,
                    day:number,
                    hour: number,
                    minute: number): BaseBazi{
        if (minute == undefined || minute == null) minute = 0;
        if (hour == undefined || hour == null) hour = 0;

        var date = new Date(year, month - 1, day, hour, minute, 0, 0);
        var jiqi = TYLunar.getSolarTerms(year, month)[0];
        var lunarday = TYLunar.getLunarObject(date);

        var bazi = {
            Y: null,
            M: null,
            D: null,
            T: null,
            Jieqi: null
        };
        bazi.Y = new GanZhi(lunarday.Lyear2);
        bazi.M = new GanZhi(lunarday.Lmonth2);
        bazi.D = new GanZhi(lunarday.Lday2);

        if (month == 2 && day >= jiqi.getDate()) {
            bazi.Y = new GanZhi(Lunar.lun.Ly);
        }

        // 23 点以后干支往后推一位。
        if (hour == 23) {
            bazi.D = new GanZhi([(bazi.D.Gan.Index + 1) % 10, (bazi.D.Zhi.Index + 1) % 12]);
        }

        //=========时干支=================================
        var zhi = Math.ceil((hour % 23) / 2.0);
        var gan = (bazi.D.Gan.Index % 5) * 2;
        gan = (gan + zhi) % 10;
        bazi.T = new GanZhi([gan, zhi]);

        if (jiqi.getDate() == day) {
            bazi.Jieqi = new Date(jiqi.getTime());
        }

        return bazi;
    }

    static findNextJieQi(date: Date, direction): Date{
        var year = date.getFullYear();
        var month = date.getMonth();
        var jieqi = TYLunar.getSolarTerms(year, month + 1)[0];
        if (date <= jieqi && direction > 0) {
            return jieqi;
        } else if (date >= jieqi && direction < 0) {
            return jieqi;
        } else {
            var daysOff = direction == 1 ? 40 : -10;
            var nextdate = TYLunar.addDays(daysOff, jieqi);
            year = nextdate.getFullYear();
            month = nextdate.getMonth();
            return TYLunar.getSolarTerms(year, month + 1)[0];
        }
    }
};

export class TYDate{
    // 干支年月日
    private gzyear: string;
    private gzmonth: string;
    private gzdate: string;

    // 农历月、日名称
    private nlmonth: string;
    private nldate: string;
    private nlleap: string; // 闰月

    // 农历月、日下标， 从0开始。
    // 距农历月首的编移量, 0对应初一 
    private nldatei: number; 
    
    private jqtime: string; //节气时间串
    private jqname: string; //节气名称

    private static shangshuoDef = ["癸亥", "己巳", "乙亥", "辛巳", "丁亥", "癸巳", "己亥", "乙巳", "辛亥", "丁巳"];
    private static yanggong13Def = ["正月十三", "二月十一", "三月初九", "四月初七", "五月初五", "六月初三", "七月初一", "七月廿九", "八月廿七", "九月廿五", "十月廿三", "十一月廿一", "十二月十九"];
    
    constructor(public date: Date){
        
        let lunarObj = TYLunar.getLunarObject(this.date);
        
        this.gzyear = lunarObj.Lyear2;
        this.gzmonth = lunarObj.Lmonth2;
        this.gzdate = lunarObj.Lday2;

        this.nlmonth = lunarObj.Lmc;
        this.nldate = lunarObj.Ldc;
        this.nlleap = lunarObj.Lleap;

        // tydate.Lmi = lunarObj;
        // tydate.jqmc = lunarObj.jqmc;
        this.jqtime = lunarObj.jqsj;
        this.jqname = lunarObj.jqmc;
        this.nldatei = lunarObj.Ldi;
    };
    
    get NLmonthFullName(): string{
        return this.NLleap + this.NLmonth + '月'
    }
    get Display(): string {
        //return tydate.Date.getDate();
        return this.JQname != "" ? this.JQname : this.date.getDate().toString();
    }
    get DisplayChi(): string {
        return this.NLdate == "初一" ? this.NLmonthFullName : this.NLdate;
    }
    get Month(): number{
        return this.date.getMonth() + 1;
    }
    get Date(): number{
        return this.date.getDate();
    }
    get Year(): number{
        return this.date.getFullYear();
    }
    
    get GZyear(){
        return this.gzyear;
    }
    get GZmonth(){
        return this.gzmonth;
    }
    get GZdate(){
        return this.gzdate;
    }
    
    get NLmonth(){
        return this.nlmonth;
    }
    get NLdate(){
        return this.nldate;
    }
    get NLleap(): string{
        return this.nlleap;
    }
    get NLdateIndex(){
        return this.nldatei;
    }
    
    get JQname(){
        return this.jqname;
    }
    get JQtime(){
        return this.jqtime;
    }

    get JianChu(){
        return TYLunar.getJianChu(this.GZmonth, this.GZdate);
    }
    get IsSuiPo(): boolean{
        let year = new GanZhi(this.GZyear);
        let date = new GanZhi(this.GZdate);
        return Math.abs(year.Zhi.Index - date.Zhi.Index) === 6;
    }
    get IsYuePo(): boolean{
        let month = new GanZhi(this.GZmonth);
        let date = new GanZhi(this.GZdate);
        return Math.abs(month.Zhi.Index - date.Zhi.Index) === 6;
    }
    get IsShangSuo() {
        // 甲年癸亥日，乙年己巳日。。。。。。
        // var arr = ["癸亥", "己巳", "乙亥", "辛巳", "丁亥", "癸巳", "己亥", "乙巳", "辛亥", "丁巳"];
        let year = new GanZhi(this.GZyear);
        return TYDate.shangshuoDef[year.Gan.Index] == this.GZdate;
    }
    get IsYangGong13() {
        // var arr = ["正月十三", "二月十一", "三月初九", "四月初七", "五月初五", "六月初三", "七月初一", "七月廿九", "八月廿七", "九月廿五", "十月廿三", "十一月廿一", "十二月十九"];
        let text = this.NLmonthFullName + this.NLdate

        for(let yang of TYDate.yanggong13Def){
            if(yang == text){
                return true;
            }
        }

        return false;
    }
}

export interface BaseBazi {
    Y: GanZhi,
    M: GanZhi,
    D: GanZhi,
    T: GanZhi,
}
