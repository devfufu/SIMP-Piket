/*
 Highcharts JS v6.0.6 (2018-02-05)

 (c) 2014 Highsoft AS
 Authors: Jon Arild Nygard / Oystein Moseng

 License: www.highcharts.com/license
*/
(function(w){"object"===typeof module&&module.exports?module.exports=w:w(Highcharts)})(function(w){var H=function(b){var w=b.each,C=b.extend,t=b.isArray,D=b.isObject,v=b.isNumber,G=b.merge,E=b.pick,n=b.reduce;return{getColor:function(p,q){var A=q.index,m=q.mapOptionsToLevel,n=q.parentColor,x=q.parentColorIndex,r=q.series,e=q.colors,t=q.siblings,h=r.points,y,F,B,a;if(p){h=h[p.i];p=m[p.level]||{};if(y=h&&p.colorByPoint)B=h.index%(e?e.length:r.chart.options.chart.colorCount),F=e&&e[B];e=h&&h.options.color;
y=p&&p.color;if(m=n)m=(m=p&&p.colorVariation)&&"brightness"===m.key?b.color(n).brighten(A/t*m.to).get():n;y=E(e,y,F,m,r.color);a=E(h&&h.options.colorIndex,p&&p.colorIndex,B,x,q.colorIndex)}return{color:y,colorIndex:a}},getLevelOptions:function(b){var q=null,A,m,p,x;if(D(b))for(q={},p=v(b.from)?b.from:1,x=b.levels,m={},A=D(b.defaults)?b.defaults:{},t(x)&&(m=n(x,function(b,e){var m,h;D(e)&&v(e.level)&&(h=G({},e),m="boolean"===typeof h.levelIsConstant?h.levelIsConstant:A.levelIsConstant,delete h.levelIsConstant,
delete h.level,e=e.level+(m?0:p-1),D(b[e])?C(b[e],h):b[e]=h);return b},{})),x=v(b.to)?b.to:1,b=0;b<=x;b++)q[b]=G({},A,D(m[b])?m[b]:{});return q},setTreeValues:function q(b,m){var n=m.before,t=m.idRoot,r=m.mapIdToNode[t],e=m.points[b.i],v=e&&e.options||{},h=0,y=[];C(b,{levelDynamic:b.level-(("boolean"===typeof m.levelIsConstant?m.levelIsConstant:1)?0:r.level),name:E(e&&e.name,""),visible:t===b.id||("boolean"===typeof m.visible?m.visible:!1)});"function"===typeof n&&(b=n(b,m));w(b.children,function(e,
n){var a=C({},m);C(a,{index:n,siblings:b.children.length,visible:b.visible});e=q(e,a);y.push(e);e.visible&&(h+=e.val)});b.visible=0<h||b.visible;n=E(v.value,h);C(b,{children:y,childrenTotal:h,isLeaf:b.visible&&!h,val:n});return b}}}(w);(function(b,w){var C=b.seriesType,t=b.seriesTypes,D=b.map,v=b.merge,G=b.extend,E=b.noop,n=b.each,p=w.getColor,q=w.getLevelOptions,A=b.grep,m=b.isNumber,H=b.isObject,x=b.isString,r=b.pick,e=b.Series,J=b.stableSort,h=b.Color,y=function(a,c,d){d=d||this;b.objectEach(a,
function(g,b){c.call(d,g,b,a)})},F=b.reduce,B=function(a,c,d){d=d||this;a=c.call(d,a);!1!==a&&B(a,c,d)};C("treemap","scatter",{showInLegend:!1,marker:!1,colorByPoint:!1,dataLabels:{enabled:!0,defer:!1,verticalAlign:"middle",formatter:function(){return this.point.name||this.point.id},inside:!0},tooltip:{headerFormat:"",pointFormat:"\x3cb\x3e{point.name}\x3c/b\x3e: {point.value}\x3cbr/\x3e"},ignoreHiddenPoint:!0,layoutAlgorithm:"sliceAndDice",layoutStartingDirection:"vertical",alternateStartingDirection:!1,
levelIsConstant:!0,drillUpButton:{position:{align:"right",x:-10,y:10}},borderColor:"#e6e6e6",borderWidth:1,opacity:.15,states:{hover:{borderColor:"#999999",brightness:t.heatmap?0:.1,halo:!1,opacity:.75,shadow:!1}}},{pointArrayMap:["value"],axisTypes:t.heatmap?["xAxis","yAxis","colorAxis"]:["xAxis","yAxis"],directTouch:!0,optionalAxis:"colorAxis",getSymbol:E,parallelArrays:["x","y","value","colorValue"],colorKey:"colorValue",translateColors:t.heatmap&&t.heatmap.prototype.translateColors,colorAttribs:t.heatmap&&
t.heatmap.prototype.colorAttribs,trackerGroups:["group","dataLabelsGroup"],getListOfParents:function(a,c){a=F(a||[],function(a,c,b){c=r(c.parent,"");void 0===a[c]&&(a[c]=[]);a[c].push(b);return a},{});y(a,function(a,g,f){""!==g&&-1===b.inArray(g,c)&&(n(a,function(a){f[""].push(a)}),delete f[g])});return a},getTree:function(){var a=D(this.data,function(a){return a.id}),a=this.getListOfParents(this.data,a);this.nodeMap=[];return this.buildNode("",-1,0,a,null)},init:function(a,c){e.prototype.init.call(this,
a,c);this.options.allowDrillToNode&&b.addEvent(this,"click",this.onClickDrillToNode)},buildNode:function(a,c,d,b,f){var g=this,z=[],l=g.points[c],I=0,e;n(b[a]||[],function(c){e=g.buildNode(g.points[c].id,c,d+1,b,a);I=Math.max(e.height+1,I);z.push(e)});c={id:a,i:c,children:z,height:I,level:d,parent:f,visible:!1};g.nodeMap[c.id]=c;l&&(l.node=c);return c},setTreeValues:function(a){var c=this,d=c.options,b=c.nodeMap[c.rootNode],d="boolean"===typeof d.levelIsConstant?d.levelIsConstant:!0,f=0,k=[],z,l=
c.points[a.i];n(a.children,function(a){a=c.setTreeValues(a);k.push(a);a.ignore||(f+=a.val)});J(k,function(a,c){return a.sortIndex-c.sortIndex});z=r(l&&l.options.value,f);l&&(l.value=z);G(a,{children:k,childrenTotal:f,ignore:!(r(l&&l.visible,!0)&&0<z),isLeaf:a.visible&&!f,levelDynamic:a.level-(d?0:b.level),name:r(l&&l.name,""),sortIndex:r(l&&l.sortIndex,-z),val:z});return a},calculateChildrenAreas:function(a,c){var d=this,b=d.options,f=d.mapOptionsToLevel[a.level+1],k=r(d[f&&f.layoutAlgorithm]&&f.layoutAlgorithm,
b.layoutAlgorithm),z=b.alternateStartingDirection,l=[];a=A(a.children,function(a){return!a.ignore});f&&f.layoutStartingDirection&&(c.direction="vertical"===f.layoutStartingDirection?0:1);l=d[k](c,a);n(a,function(a,b){b=l[b];a.values=v(b,{val:a.childrenTotal,direction:z?1-c.direction:c.direction});a.pointValues=v(b,{x:b.x/d.axisRatio,width:b.width/d.axisRatio});a.children.length&&d.calculateChildrenAreas(a,a.values)})},setPointValues:function(){var a=this,c=a.xAxis,d=a.yAxis;n(a.points,function(b){var f=
b.node,k=f.pointValues,g,l,e;e=(a.pointAttribs(b)["stroke-width"]||0)%2/2;k&&f.visible?(f=Math.round(c.translate(k.x,0,0,0,1))-e,g=Math.round(c.translate(k.x+k.width,0,0,0,1))-e,l=Math.round(d.translate(k.y,0,0,0,1))-e,k=Math.round(d.translate(k.y+k.height,0,0,0,1))-e,b.shapeType="rect",b.shapeArgs={x:Math.min(f,g),y:Math.min(l,k),width:Math.abs(g-f),height:Math.abs(k-l)},b.plotX=b.shapeArgs.x+b.shapeArgs.width/2,b.plotY=b.shapeArgs.y+b.shapeArgs.height/2):(delete b.plotX,delete b.plotY)})},setColorRecursive:function(a,
c,d,b,f){var k=this,g=k&&k.chart,g=g&&g.options&&g.options.colors,l;if(a){l=p(a,{colors:g,index:b,mapOptionsToLevel:k.mapOptionsToLevel,parentColor:c,parentColorIndex:d,series:k,siblings:f});if(c=k.points[a.i])c.color=l.color,c.colorIndex=l.colorIndex;n(a.children||[],function(c,b){k.setColorRecursive(c,l.color,l.colorIndex,b,a.children.length)})}},algorithmGroup:function(a,c,b,g){this.height=a;this.width=c;this.plot=g;this.startDirection=this.direction=b;this.lH=this.nH=this.lW=this.nW=this.total=
0;this.elArr=[];this.lP={total:0,lH:0,nH:0,lW:0,nW:0,nR:0,lR:0,aspectRatio:function(a,c){return Math.max(a/c,c/a)}};this.addElement=function(a){this.lP.total=this.elArr[this.elArr.length-1];this.total+=a;0===this.direction?(this.lW=this.nW,this.lP.lH=this.lP.total/this.lW,this.lP.lR=this.lP.aspectRatio(this.lW,this.lP.lH),this.nW=this.total/this.height,this.lP.nH=this.lP.total/this.nW,this.lP.nR=this.lP.aspectRatio(this.nW,this.lP.nH)):(this.lH=this.nH,this.lP.lW=this.lP.total/this.lH,this.lP.lR=
this.lP.aspectRatio(this.lP.lW,this.lH),this.nH=this.total/this.width,this.lP.nW=this.lP.total/this.nH,this.lP.nR=this.lP.aspectRatio(this.lP.nW,this.nH));this.elArr.push(a)};this.reset=function(){this.lW=this.nW=0;this.elArr=[];this.total=0}},algorithmCalcPoints:function(a,c,b,g){var d,k,e,l,m=b.lW,h=b.lH,u=b.plot,r,t=0,p=b.elArr.length-1;c?(m=b.nW,h=b.nH):r=b.elArr[b.elArr.length-1];n(b.elArr,function(a){if(c||t<p)0===b.direction?(d=u.x,k=u.y,e=m,l=a/e):(d=u.x,k=u.y,l=h,e=a/l),g.push({x:d,y:k,width:e,
height:l}),0===b.direction?u.y+=l:u.x+=e;t+=1});b.reset();0===b.direction?b.width-=m:b.height-=h;u.y=u.parent.y+(u.parent.height-b.height);u.x=u.parent.x+(u.parent.width-b.width);a&&(b.direction=1-b.direction);c||b.addElement(r)},algorithmLowAspectRatio:function(a,b,d){var c=[],f=this,k,e={x:b.x,y:b.y,parent:b},l=0,m=d.length-1,h=new this.algorithmGroup(b.height,b.width,b.direction,e);n(d,function(d){k=d.val/b.val*b.height*b.width;h.addElement(k);h.lP.nR>h.lP.lR&&f.algorithmCalcPoints(a,!1,h,c,e);
l===m&&f.algorithmCalcPoints(a,!0,h,c,e);l+=1});return c},algorithmFill:function(a,b,d){var c=[],f,k=b.direction,e=b.x,l=b.y,h=b.width,m=b.height,r,t,p,q;n(d,function(d){f=d.val/b.val*b.height*b.width;r=e;t=l;0===k?(q=m,p=f/q,h-=p,e+=p):(p=h,q=f/p,m-=q,l+=q);c.push({x:r,y:t,width:p,height:q});a&&(k=1-k)});return c},strip:function(a,b){return this.algorithmLowAspectRatio(!1,a,b)},squarified:function(a,b){return this.algorithmLowAspectRatio(!0,a,b)},sliceAndDice:function(a,b){return this.algorithmFill(!0,
a,b)},stripes:function(a,b){return this.algorithmFill(!1,a,b)},translate:function(){var a=this,b=a.options,d=a.rootNode=r(a.rootNode,a.options.rootId,""),g,f;e.prototype.translate.call(a);f=a.tree=a.getTree();g=a.nodeMap[d];a.mapOptionsToLevel=q({from:0<g.level?g.level:1,levels:b.levels,to:f.height,defaults:{levelIsConstant:a.options.levelIsConstant,colorByPoint:b.colorByPoint}});""===d||g&&g.children.length||(a.drillToNode("",!1),d=a.rootNode,g=a.nodeMap[d]);B(a.nodeMap[a.rootNode],function(b){var c=
!1,d=b.parent;b.visible=!0;if(d||""===d)c=a.nodeMap[d];return c});B(a.nodeMap[a.rootNode].children,function(a){var b=!1;n(a,function(a){a.visible=!0;a.children.length&&(b=(b||[]).concat(a.children))});return b});a.setTreeValues(f);a.axisRatio=a.xAxis.len/a.yAxis.len;a.nodeMap[""].pointValues=d={x:0,y:0,width:100,height:100};a.nodeMap[""].values=d=v(d,{width:d.width*a.axisRatio,direction:"vertical"===b.layoutStartingDirection?0:1,val:f.val});a.calculateChildrenAreas(f,d);a.colorAxis?a.translateColors():
b.colorByPoint||a.setColorRecursive(a.tree);b.allowDrillToNode&&(b=g.pointValues,a.xAxis.setExtremes(b.x,b.x+b.width,!1),a.yAxis.setExtremes(b.y,b.y+b.height,!1),a.xAxis.setScale(),a.yAxis.setScale());a.setPointValues()},drawDataLabels:function(){var a=this,b=a.mapOptionsToLevel,d=A(a.points,function(a){return a.node.visible}),g,f;n(d,function(c){f=b[c.node.level];g={style:{}};c.node.isLeaf||(g.enabled=!1);f&&f.dataLabels&&(g=v(g,f.dataLabels),a._hasPointLabels=!0);c.shapeArgs&&(g.style.width=c.shapeArgs.width,
c.dataLabel&&c.dataLabel.css({width:c.shapeArgs.width+"px"}));c.dlOptions=v(g,c.options.dataLabels)});e.prototype.drawDataLabels.call(this)},alignDataLabel:function(a){t.column.prototype.alignDataLabel.apply(this,arguments);a.dataLabel&&a.dataLabel.attr({zIndex:(a.node.zIndex||0)+1})},pointAttribs:function(a,b){var c=H(this.mapOptionsToLevel)?this.mapOptionsToLevel:{},e=a&&c[a.node.level]||{},c=this.options,f=b&&c.states[b]||{},k=a&&a.getClassName()||"";a={stroke:a&&a.borderColor||e.borderColor||
f.borderColor||c.borderColor,"stroke-width":r(a&&a.borderWidth,e.borderWidth,f.borderWidth,c.borderWidth),dashstyle:a&&a.borderDashStyle||e.borderDashStyle||f.borderDashStyle||c.borderDashStyle,fill:a&&a.color||this.color};-1!==k.indexOf("highcharts-above-level")?(a.fill="none",a["stroke-width"]=0):-1!==k.indexOf("highcharts-internal-node-interactive")?(b=r(f.opacity,c.opacity),a.fill=h(a.fill).setOpacity(b).get(),a.cursor="pointer"):-1!==k.indexOf("highcharts-internal-node")?a.fill="none":b&&(a.fill=
h(a.fill).brighten(f.brightness).get());return a},drawPoints:function(){var a=this,b=A(a.points,function(a){return a.node.visible});n(b,function(b){var c="level-group-"+b.node.levelDynamic;a[c]||(a[c]=a.chart.renderer.g(c).attr({zIndex:1E3-b.node.levelDynamic}).add(a.group));b.group=a[c]});t.column.prototype.drawPoints.call(this);a.options.allowDrillToNode&&n(b,function(b){b.graphic&&(b.drillId=a.options.interactByLeaf?a.drillToByLeaf(b):a.drillToByGroup(b))})},onClickDrillToNode:function(a){var b=
(a=a.point)&&a.drillId;x(b)&&(a.setState(""),this.drillToNode(b))},drillToByGroup:function(a){var b=!1;1!==a.node.level-this.nodeMap[this.rootNode].level||a.node.isLeaf||(b=a.id);return b},drillToByLeaf:function(a){var b=!1;if(a.node.parent!==this.rootNode&&a.node.isLeaf)for(a=a.node;!b;)a=this.nodeMap[a.parent],a.parent===this.rootNode&&(b=a.id);return b},drillUp:function(){var a=this.nodeMap[this.rootNode];a&&x(a.parent)&&this.drillToNode(a.parent)},drillToNode:function(a,b){var c=this.nodeMap[a];
this.idPreviousRoot=this.rootNode;this.rootNode=a;""===a?this.drillUpButton=this.drillUpButton.destroy():this.showDrillUpButton(c&&c.name||a);this.isDirty=!0;r(b,!0)&&this.chart.redraw()},showDrillUpButton:function(a){var b=this;a=a||"\x3c Back";var d=b.options.drillUpButton,e,f;d.text&&(a=d.text);this.drillUpButton?(this.drillUpButton.placed=!1,this.drillUpButton.attr({text:a}).align()):(f=(e=d.theme)&&e.states,this.drillUpButton=this.chart.renderer.button(a,null,null,function(){b.drillUp()},e,f&&
f.hover,f&&f.select).addClass("highcharts-drillup-button").attr({align:d.position.align,zIndex:7}).add().align(d.position,!1,d.relativeTo||"plotBox"))},buildKDTree:E,drawLegendSymbol:b.LegendSymbolMixin.drawRectangle,getExtremes:function(){e.prototype.getExtremes.call(this,this.colorValueData);this.valueMin=this.dataMin;this.valueMax=this.dataMax;e.prototype.getExtremes.call(this)},getExtremesFromAll:!0,bindAxes:function(){var a={endOnTick:!1,gridLineWidth:0,lineWidth:0,min:0,dataMin:0,minPadding:0,
max:100,dataMax:100,maxPadding:0,startOnTick:!1,title:null,tickPositions:[]};e.prototype.bindAxes.call(this);b.extend(this.yAxis.options,a);b.extend(this.xAxis.options,a)},utils:{recursive:B,reduce:F}},{getClassName:function(){var a=b.Point.prototype.getClassName.call(this),c=this.series,d=c.options;this.node.level<=c.nodeMap[c.rootNode].level?a+=" highcharts-above-level":this.node.isLeaf||r(d.interactByLeaf,!d.allowDrillToNode)?this.node.isLeaf||(a+=" highcharts-internal-node"):a+=" highcharts-internal-node-interactive";
return a},isValid:function(){return this.id||m(this.value)},setState:function(a){b.Point.prototype.setState.call(this,a);this.graphic&&this.graphic.attr({zIndex:"hover"===a?1:0})},setVisible:t.pie.prototype.pointClass.prototype.setVisible})})(w,H)});
