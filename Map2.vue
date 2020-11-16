<template>
<div>
	<div style="display:flex; flex-direction: row; justify-content:space-between;">
		<button @click="reset" class="boxTitle" align="left">재난발생 위치</button>
		<h5 class="textal" align="left">Segment 반지름 : {{segmentR}}m</h5>
		<div v-if="calaAuto" style="display:flex">
			<h5 class="textal" align="left">재난 전송 모드 : 자동</h5> 
			<!-- <img src="../assets/greenlight.png" style="width: 16px;height: 16px;margin-left: 7px;margin-top: 2px;"> -->
		</div>
		<div v-else style="display:flex">
			<h5 class="textal" align="left">재난 전송 모드 : 수동</h5> 
			<!-- <img src="../assets/redlight.png" style="width: 16px;height: 16px;margin-left: 7px;margin-top: 2px;"> -->
		</div>

		<h5 class="textal" align="left">사용자 크기 : {{markerXsize}}</h5>
		<h5 class="textal" align="left">현재 시간 : {{date}} {{time}}</h5>
	</div>
		
	<div id="map1">	
		<div id="mouse-position">
	</div>

	<div id="panel" display="flex" style="position: absolute;top:10px;right:30%;width: 402px;height:20px;z-index: 1000;">
	<v-text-field 
	  style="width:300px"
	  id = "mapfind"
            prepend-inner-icon="mdi-map-marker"
      class="mx-2"
	  solo
      label="지점명 입력 (ex.대구광역시청)"
      rows="1"
	  v-model="apilocation"
    >
	</v-text-field>
	<button @click="apiSample" class="boxTitle" align="left" style="position: absolute;top:15px;right:-310px;width: 402px;height:20px;border:none; outline:none;">검색</button>
	</div>

		<div id="panel" style="position:absolute;top:520px;right:10px;width:54px;height:100px;z-index:1000;">			
		<button id="testButton" class="btn btn-primary" @click="changesatellite" style="border:none; outline:none;">
			<img src="../assets/satellite.png" style="width: 38px;" >
			</button>
			<div style='position:absolute;top:-510px;right:0px;width:220px;height:100px;z-index:1000;'>	
			<input type="checkbox" id="cal"  checked="checked" value="One" @click="visibilityC" v-bind:disabled="calcount == 0 ? true:false" >
           	<label for="one"> 재난 </label>
        	<input type="checkbox" id="seg" checked="checked" value="Two" @click="visibilityS"  v-bind:disabled="calcount == 0 ? true:false" >
            <label for="two"> 세그먼트 </label>
            <input type="checkbox" id="uid" checked="checked" value="Three" @click="visibilityU"  v-bind:disabled="uuidCount == 0 ? true:false" >
            <label for="three"> 사용자</label>
			</div>
			<spinner :loading="LoadingStatus"></spinner>
		</div>
		<div style="position:absolute;top:15px;width:54px;height:100px;z-index:1000;">
			<button id="daeguButton" class="btn btn-primary" @click="gotoDaegu" style="border:none; outline:none;">
			<img src="../assets/daeguLogoShort.png" style="width: 38px;" >
			</button>
		</div>
	</div>
	  <SweetModal ref="searchplace" title="검색 결과" style="z-index:999999 height:500px" >
		  <template>
			<div v-for="(info,index) in locationList" :key="index">
		  		<v-list-item two-line>
					<v-list-item-content>
						<v-list-item-title>{{info.mainname}}</v-list-item-title>
						<v-list-item-subtitle>{{info.subaddress}}</v-list-item-subtitle>
					</v-list-item-content>
						<v-btn height="25px" @click="apiMove(index)"> 이동 </v-btn>
				</v-list-item>
			</div>
			<br>
		
		  </template>
      </SweetModal>
	  <SweetModal icon="warning" ref="nosearchplace" title="검색 실패">
        검색 결과가 없습니다.
      </SweetModal>
</div>
</template>

<script>
import {store} from '../store/index.js';
import {defaults} from 'ol/control';
import {EventBus} from "./event-bus";
import mapmarkerpng from "../assets/mapmarker.png"
import peoplesCircle from "../assets/blackdot2.png"
import satellite from "../assets/satellite.png"
import {SweetModal,SweetModalTab} from 'sweet-modal-vue'
import Spinner from './Spinner';
import greenLight from '../assets/greenlight.png';
import redLight from '../assets/redlight.png';

let map = '';
let clustering = "";
let markers = '';
let popup = '';
let calamityList = new Array(); //재난 배열 
let uuidFeatures = new Array(); //유저 배열
let segmentList = new Array(); //세그먼트 배열
let segmentRadius = 100; //세그먼트 반지름 
let segmentFeatures = new Array(); //세그먼트의 feature(polygon)
let userMarkers = "";
let segmentLayer = "";
let vectorLayer = "";
let centerlayer = "";
let count = 0;
export default {

	props: ['pointX', 'pointY', 'radius', 'calLevel'],
	components:{
		Spinner,
		SweetModal,
    	SweetModalTab
	},
	data() {
		return {
			calaAuto : this.$store.state.calaAuto,
			LoadingStatus:false,
			layerselect: '',
			calview :false,
			segview :false,
			uuiview :false,
			segmentR : this.$store.state.segmentR,
			calviewcount :0,
			segviewcount :0,
			uuiviewcount :0,
			apilocation : "",
			apicurrent : "",
			network : '',
			message: '',
			point: '',
			calPrimary:'',
			calDate: '',
			lat: 0,
			log: 0,
			markerXsize : 5,
			markerYsize : 5,
			radius2: 0,
			level: "",
			type : '',
			standard_style: {
				strokeColor: 'red',
				strokeOpacity: 1,
				strokeWidth: 3,
				fillOpacity: 0.4,
				fillColor: "red"
			},
			orange_style: {
				strokeColor: 'orange',
				strokeOpacity: 1,
				strokeWidth: 3,
				fillOpacity: 0.4,
				fillColor: "orange"
			},
			yellow_style: {
				strokeColor: 'yellow',
				strokeOpacity: 1,
				strokeWidth: 3,
				fillOpacity: 0.4,
				fillColor: "yellow"
			},
			blue_style: {
				strokeColor: 'blue',
				strokeOpacity: 1,
				strokeWidth: 3,
				fillOpacity: 0.4,
				fillColor: "blue"
			},
			segment_style: {
				strokeColor: 'black',
				strokeOpacity: 0.1,
				strokeWidth: 1,
				fillOpacity: 0.1,
				fillColor: "${black}"
			}, //세그먼트 Style
			linsStyle: {
				strokeColor: 'black',
				strokeOpacity: 0.5,
				strokeWidth: 1,
				fillOpacity: 0.5,
				fillColor: "${black}"
			}, //라인 Style
			centerStyle:{
				strokeColor: 'red',
				strokeOpacity: 1.0,
				strokeWidth: 1,
				fillOpacity: 1.0,
				fillColor: "${red}"
				
			},

			calcount: 0,

			segcount: 0,
			segmentIndex: {
				segNum: 0,
				calNum: 0,
				segLat: 0,
				segLog: 0,
				segName: 0
			},
			uuidCount: 0,
			markerFeatures: [],
			hover: '',
			time:"",
			date:"",
			week : ['일', '월', '화', '수', '목', '금', '토'],
			currentIp : "",
			locationList : []
			//x 증가율 radius * xplus
			//y 증가율 radius * 3
		}
	},
	created() {

    	EventBus.$on('start:spinner', this.startSpinner);
    	EventBus.$on('end:spinner', this.endSpinner);

		//여기는 재난이 들어오는 곳 
		EventBus.$on('use-eventbus', calIndex => {
			if (count != 0) {
				this.deleteF();
			}
			
            setTimeout(()=> {  }, 1000);
			// this.LoadingStatus = true;
			// setTimeout(this.startSpinner(),2000)
      		// EventBus.$emit('start:spinner'); 
			var cal = document.getElementById("cal")
			cal.checked=true;
			var seg = document.getElementById("seg")
			seg.checked=true;
						
			this.calPrimary = calIndex.calNum;
			this.lat = calIndex.lat * 1;
			this.log = calIndex.log * 1;
			this.radius2 = calIndex.radius * 1;
			this.level = calIndex.callevel + "";
			this.calDate = calIndex.calTime;
			this.type = calIndex.calType;
			this.message = calIndex.context;

			switch (this.level) {
				case "심각":
					vectorLayer = new OpenLayers.Layer.Vector("Overlay", {
						styleMap: new OpenLayers.StyleMap(
							this.standard_style
						)
					});
					break;
				case "경계":
					vectorLayer = new OpenLayers.Layer.Vector("Overlay", {
						styleMap: new OpenLayers.StyleMap(
							this.orange_style
						)
					});
					break;
				case "주의":
					vectorLayer = new OpenLayers.Layer.Vector("Overlay", {
						styleMap: new OpenLayers.StyleMap(
							this.yellow_style
						)
					});
					break;
				case "관심":
					vectorLayer = new OpenLayers.Layer.Vector("Overlay", {
						styleMap: new OpenLayers.StyleMap(
							this.blue_style
						)
					});
					break;
			}

			segmentLayer = new OpenLayers.Layer.Vector("segmentlay", {
				styleMap: new OpenLayers.StyleMap(
					this.segment_style
				)
			});

			
			vectorLayer.setVisibility(true);
			segmentLayer.setVisibility(true);

			centerlayer = new OpenLayers.Layer.Vector("centerLay",{
				styleMap: new OpenLayers.StyleMap(
					this.centerStyle
				)
			});

			this.drawMainCircle();
			count++;
			
		});

		EventBus.$on('use-eventbus-uuidTest', uuidList => {
			this.uuidCount += 1
			userMarkers.setVisibility(true);
			var uuid = document.getElementById("uid")
			uid.checked=true;
			uuidFeatures = new Array();
			for (var i = 0; i < uuidList.length; i++) {
				var uuidindex = {
					x: uuidList[i].uuidX,
					y: uuidList[i].uuidY,
					uuidcontainseg: -1,
					uuid: uuidList[i].uuidId,
					userid : uuidList[i].userid
				}
				uuidFeatures.push(uuidindex);
			}

			this.drawUUID(uuidFeatures);
		});

		EventBus.$on('deletemarker', index => {
			if(markers!=null){
				markers.destroy()

			}
		});
		EventBus.$on('timechange', index => {
			this.updateTime();
		});

	},
	mounted() {
		
		this.updateTime();
		this.init();
	},
	computed: {},
	methods: {
		visibilityC(){
			if (vectorLayer.getVisibility() == true) {
        		vectorLayer.setVisibility(false);
    			} else {
        		vectorLayer.setVisibility(true);
    			}
		},visibilityS(){
			if (segmentLayer.getVisibility() == true) {
        		segmentLayer.setVisibility(false);
    			} else {
        		segmentLayer.setVisibility(true);
    			}
		},visibilityU(){
			if (userMarkers.getVisibility() == true) {
        		userMarkers.setVisibility(false);
    			} else {
        		userMarkers.setVisibility(true);
    			}
		},
		startSpinner(){
      		this.LoadingStatus = true;
    	},
    	endSpinner(){
      		this.LoadingStatus = false;
    	},
		init() {
			OpenLayers.Map.prototype.isValidZoomLevel = function(zoomlevel){
        //return null!=zoomlevel && 8<=zoomlevel && zoomlevel<this.getNumZoomLevels();  
				return ((zoomlevel != null) &&
						(zoomlevel >= 6) && 
						(zoomlevel < this.getNumZoomLevels()));
    		};
			map = new ngii_wmts.map("map1", {
				
				controls: [],
				projection: "EPSG:5179",
				center: new OpenLayers.LonLat(this.$store.state.startLat, this.$store.state.startLon),
				zoom: 10,
				//mapmode:3,
				mapMode:0,
				
				numZoomLevels :10,
				eventListeners: {
					featureclick: function (e) {
						if (e.feature.layer.name == 'segmentlay') {
							e.feature.renderIntent = "select";
							var j = 0;
							
							for (j = 0; j < segmentList.length; j++) {
								var segcode = e.feature.id.split('_');
								if (segmentList[j].segId == segcode[3]) {
									//해당 세그먼트에 몇명이 있는지 확인 
									if (popup) {
										map.removePopup(popup)
									}
									var popuplocation = new OpenLayers.LonLat(segmentList[j].segLat, segmentList[j].segLog)

									popup = new OpenLayers.Popup("chicken",
										popuplocation,
										new OpenLayers.Size(200, 60),
										"세그먼트 번호 : " + segmentList[j].segId + "<br>" + '<div style="color:#FF0000">재난 발생시 인원 :   ' + segmentList[j].segmentUserList.length + "명", true);

									map.addPopup(popup);
								}
							}
						}
					}
				}
			});
			map._addDefaultMapModeBox({left:"1%", top:"500px"});
			//지도 객체 생성 
			map.addControl(new OpenLayers.Control.MousePosition());
			// map.addControl(new OpenLayers.Control.ScaleLine());
			map.addControl(new OpenLayers.Control.KeyboardDefaults());
			
			var control = new OpenLayers.Control();
			OpenLayers.Util.extend(control, {
				draw: function () {
					// this Handler.Box will intercept the shift-mousedown
					// before Control.MouseDefault gets to see it
					this.box = new OpenLayers.Handler.Box(control, {
						"done": this.notice
					}, {
						keyMask: OpenLayers.Handler.MOD_SHIFT
					});
					this.box.activate();
				},
				notice: function (bounds) {
					OpenLayers.Console.userError(bounds);
				}
			});

			map.addControl(control);

			userMarkers = new OpenLayers.Layer.Markers("userMarkers",{
				 strategies: [ new OpenLayers.Strategy.Cluster({distance: 30}) ]
				 });
		},

		drawMainCircle() {
			var x = this.lat;
			var y = this.log;
			var length = 0;
			var count = 0;
			var tempsegR = this.$store.state.segmentR*1;
			this.segmentR = this.$store.state.segmentR;
			var xplus = tempsegR + tempsegR*0.715;
			var yplus = tempsegR*3;
			map.removePopup(popup)
			//가장 큰 재난 원 
			var point = new OpenLayers.Geometry.Point(x, y);
			var mainCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, this.radius2, 36, 0);
			var mainFeature = new OpenLayers.Feature.Vector(mainCircle);
			console.log("Map drawing" + mainFeature.id);

			vectorLayer.addFeatures(mainFeature)
			
			this.calcount += 1;
			var calamityIndex = {
				calcount: this.calcount,
				calId: mainFeature.id,
				mainlat: x,
				mainlog: y,
				mainradius: this.radius2,
				mainlevel: this.level,
				mainType: this.type,
				calmessage: this.message
			}
			calamityList.push(calamityIndex)

			// 기본 세그먼트 0.0 에 있는거 그리기
			var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, tempsegR, 36, 0);
			var featureCircle = new OpenLayers.Feature.Vector(myCircle);
			segmentLayer.addFeatures(featureCircle)
			this.inputSegmentInList(mainFeature.id, x, y, featureCircle.id)
			segmentFeatures.push(featureCircle)

			var ycount = 0
			while (true) {


				if (ycount == 0) {
					while (true) {
						
						length += xplus;
						//늘어나는 길이가 루트3만큼 늘어난다.
						var point = new OpenLayers.Geometry.Point(x + length, this.log);
						var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, tempsegR, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(myCircle);
						if (!myCircle.intersects(mainCircle)) break;
						segmentLayer.addFeatures(featureCircle)
						this.inputSegmentInList(mainFeature.id, x + length, this.log, featureCircle.id)
						segmentFeatures.push(featureCircle)
						//this.inputSegmentInList(this.calcount,x + length,this.log)
						var minuspoint = new OpenLayers.Geometry.Point(x - length, this.log);
						var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, tempsegR, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
						segmentLayer.addFeatures(featureCircle)
						this.inputSegmentInList(mainFeature.id, x - length, this.log, featureCircle.id)
						segmentFeatures.push(featureCircle)
						//this.inputSegmentInList(this.calcount,x - length,this.log)
					} //기본이 되는 선을 하나 그린다.
					ycount = 1;
					length = 0;
				} else {
					y += yplus
					var point = new OpenLayers.Geometry.Point(x, y);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, tempsegR, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);

					if (!myCircle.intersects(mainCircle)) break;
					//리스트에 집어 넣기
					segmentLayer.addFeatures(featureCircle)
					this.inputSegmentInList(mainFeature.id, x, y, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var reverseY = this.log - (y - this.log)
					var minuspoint = new OpenLayers.Geometry.Point(x, reverseY);
					var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, tempsegR, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
					segmentLayer.addFeatures(featureCircle)

					this.inputSegmentInList(mainFeature.id, x, reverseY, featureCircle.id)
					segmentFeatures.push(featureCircle)
					ycount++
					//y축으로 +- 를 쫙 그리고 
					while (true) {
						
						//그 y축을 가지고 x축을 그린다.
						length += xplus;
						var point = new OpenLayers.Geometry.Point(x + length, y);
						var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, tempsegR, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(myCircle);
						if (!mainCircle.intersects(myCircle)) break;
						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, x + length, y, featureCircle.id)
						segmentFeatures.push(featureCircle)
						var minuspoint = new OpenLayers.Geometry.Point(x - length, y);
						var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, tempsegR, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, x - length, y, featureCircle.id)
						segmentFeatures.push(featureCircle)
						var point = new OpenLayers.Geometry.Point(x + length, reverseY);
						var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, tempsegR, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(myCircle);

						segmentLayer.addFeatures(featureCircle)
						this.inputSegmentInList(mainFeature.id, x + length, reverseY, featureCircle.id)
						segmentFeatures.push(featureCircle)
						var minuspoint = new OpenLayers.Geometry.Point(x - length, reverseY);
						var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, tempsegR, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, x - length, reverseY, featureCircle.id)
						segmentFeatures.push(featureCircle)
					}
					length = 0;
				}
			}

			var x = this.lat;
			var y = this.log;

			var length = 0;
			var ylength = tempsegR * 1.5;
			var count = 0;
			var yside = tempsegR 
			while (true) {
					
				if (count == 0) {
					var point2 = new OpenLayers.Geometry.Point(x + (xplus / 2), y + ylength);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point2, tempsegR, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);

					if (!myCircle.intersects(mainCircle)) break;
					segmentLayer.addFeatures(featureCircle)

					this.inputSegmentInList(mainFeature.id, x + (xplus / 2), y + ylength, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var point3 = new OpenLayers.Geometry.Point(x - (xplus / 2), y + ylength);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point3, tempsegR, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);
					segmentLayer.addFeatures(featureCircle)
					this.inputSegmentInList(mainFeature.id, x - (xplus / 2), y + ylength, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var point2 = new OpenLayers.Geometry.Point(x + (xplus / 2), y - ylength);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point2, tempsegR, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);
					segmentLayer.addFeatures(featureCircle)
					this.inputSegmentInList(mainFeature.id, x + (xplus / 2), y - ylength, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var point3 = new OpenLayers.Geometry.Point(x - (xplus / 2), y - ylength);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point3, tempsegR, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);
					segmentLayer.addFeatures(featureCircle)
					this.inputSegmentInList(mainFeature.id, x - (xplus / 2), y - ylength, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var ypluspoint = y + ylength
					var yminuspoint = y - ylength
					var plusx = x + (xplus / 2);
					var minusx = x - (xplus / 2);
					while (true) {
						//그 y축을 가지고 x축을 그린다.
						length += xplus;
						var point = new OpenLayers.Geometry.Point(plusx + length, ypluspoint);
						var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, tempsegR, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(myCircle);
						if (!mainCircle.intersects(myCircle)) break;
						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, plusx + length, ypluspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)
						var minuspoint = new OpenLayers.Geometry.Point(minusx - length, ypluspoint);
						var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, tempsegR, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, minusx - length, ypluspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)
						var point = new OpenLayers.Geometry.Point(plusx + length, yminuspoint);
						var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, tempsegR, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(myCircle);

						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, plusx + length, yminuspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)
						var minuspoint = new OpenLayers.Geometry.Point(minusx - length, yminuspoint);
						var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, tempsegR, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, minusx - length, yminuspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)
					}
					length = 0;


					count++;
				} else {
					ylength += yplus
					var point2 = new OpenLayers.Geometry.Point(x + (xplus / 2), y + ylength);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point2, tempsegR, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);

					if (!myCircle.intersects(mainCircle)) break;
					segmentLayer.addFeatures(featureCircle)

					this.inputSegmentInList(mainFeature.id, x + (xplus / 2), y + ylength, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var point3 = new OpenLayers.Geometry.Point(x - (xplus / 2), y + ylength);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point3, tempsegR, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);
					segmentLayer.addFeatures(featureCircle)
					this.inputSegmentInList(mainFeature.id, x - (xplus / 2), y + ylength, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var point2 = new OpenLayers.Geometry.Point(x + (xplus / 2), y - ylength);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point2, tempsegR, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);
					segmentLayer.addFeatures(featureCircle)
					this.inputSegmentInList(mainFeature.id, x + (xplus / 2), y - ylength, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var point3 = new OpenLayers.Geometry.Point(x - (xplus / 2), y - ylength);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point3, tempsegR, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);
					segmentLayer.addFeatures(featureCircle)
					this.inputSegmentInList(mainFeature.id, x - (xplus / 2), y - ylength, featureCircle.id)
					segmentFeatures.push(featureCircle)
					//대각선 위치에 있는 원 그리기 
					var ypluspoint = y + ylength
					var yminuspoint = y - ylength
					var plusx = x + (xplus / 2);
					var minusx = x - (xplus / 2);
					while (true) {
						
						//그 y축을 가지고 x축을 그린다.
						length += xplus;
						var point = new OpenLayers.Geometry.Point(plusx + length, ypluspoint);
						var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, tempsegR, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(myCircle);
						if (!mainCircle.intersects(myCircle)) break;
						segmentLayer.addFeatures(featureCircle)
						this.inputSegmentInList(mainFeature.id, plusx + length, ypluspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)

						var minuspoint = new OpenLayers.Geometry.Point(minusx - length, ypluspoint);
						var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, tempsegR, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, minusx - length, ypluspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)
						var point = new OpenLayers.Geometry.Point(plusx + length, yminuspoint);
						var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, tempsegR, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(myCircle);
						segmentLayer.addFeatures(featureCircle)
						this.inputSegmentInList(mainFeature.id, plusx + length, yminuspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)

						var minuspoint = new OpenLayers.Geometry.Point(minusx - length, yminuspoint);
						var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, tempsegR, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
						segmentLayer.addFeatures(featureCircle)
						this.inputSegmentInList(mainFeature.id, minusx - length, yminuspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)
					}
					length = 0;
				}
			}
		//	centerlayer.addFeatures(mainLineFeature)

			map.addLayer(vectorLayer);
			map.addLayer(segmentLayer);
			// map.addLayer(centerlayer);
			
			var pointZoom = new OpenLayers.LonLat(this.lat, this.log)
			map.setCenter(pointZoom, 8)
		
			var segmentSendingList = [];
			var countall = 0;
			var countsub = 0;
			
			for (var k = 0; k < uuidFeatures.length; k++) {
				uuidFeatures[k].uuidcontainseg =-1;
			}
			var calculateradius = calamityIndex.mainradius;
			var calculateuuidList = new Array();

			for (var k = 0; k < uuidFeatures.length; k++) {
			if((Math.sqrt(Math.abs((uuidFeatures[k].x - calamityIndex.mainlat) * (uuidFeatures[k].x - calamityIndex.mainlat)) + Math.abs((uuidFeatures[k].y - calamityIndex.mainlog) * (uuidFeatures[k].y - calamityIndex.mainlog))))< calamityIndex.mainradius+200){	
				var calculateuuidIndex ={
					x: uuidFeatures[k].x,
					y: uuidFeatures[k].y,
					uuidcontainseg: -1,
					uuid: uuidFeatures[k].uuid,
					userid : uuidFeatures[k].userid 
				}
					calculateuuidList.push(calculateuuidIndex);
				}
			}
			
			//모든 uuid리스트의 포함관계를 초기화 시킨다.
				var p = ''
				for (var j = 0; j < segmentFeatures.length; j++) {
					if (segmentList[j].calIndex == calamityIndex.calId) {
						// 모든 세그먼트중 해당 재난에 들어있는지 안들어있는지 판단
						for (var k = 0; k < calculateuuidList.length; k++) {
							//모든 uuid 중 
							p = new OpenLayers.Geometry.Point(calculateuuidList[k].x, calculateuuidList[k].y);
							if (segmentFeatures[j].geometry.intersects(p)) {
								countall++;

								if (calculateuuidList[k].uuidcontainseg == -1) {
									
									var segmentUserIndex ={
										uuid : "",
										userid : ""
									}
									segmentUserIndex.uuid = calculateuuidList[k].uuid
									segmentUserIndex.userid = calculateuuidList[k].userid
						
									segmentList[j].segmentUserList.push(segmentUserIndex)
						
									calculateuuidList[k].uuidcontainseg = segmentList[j].segId;
									segmentSendingList.push(segmentList[j])
							
								}
								else if (calculateuuidList[k].uuidcontainseg != -1) {
									for (var h = 0; h < segmentList.length; h++) {
										if (segmentList[h].segId == calculateuuidList[k].uuidcontainseg) {
											//원래 들어있던게 다를 경우 
											if (segmentList[j].segmentfromcalamity <= segmentList[h].segmentfromcalamity) {
												calculateuuidList[k].uuidcontainseg = segmentList[j].segId;
												countsub++;
											}
										}
									}
								}
							}
						}
					}
				}

				for (var k = 0; k < uuidFeatures.length; k++) {
					for(var j=0; j< calculateuuidList.length;j++){
						if(uuidFeatures[k].uuid==calculateuuidList[j].uuid){
							uuidFeatures[k].uuidcontainseg = calculateuuidList[j].uuidcontainseg;
							break;
						}
					}
				}
				var calamityAllinfo = {
					targetUser: 0,
					dangerUser: 0,
					callPri: this.calPrimary,
					callat: calamityIndex.mainlat,
					callon: calamityIndex.mainlog,
					caldate: this.calDate,
					callevel: this.level,
					calRange: this.radius2,
					calType: calamityIndex.mainType,
					calNumber: this.calcount,
					calMessageInfo: calamityIndex.calmessage,
					uuidAllInfo: calculateuuidList,
					segmentSendingFeature: segmentSendingList
				}
				EventBus.$emit("calamity-test", calamityAllinfo)
		},
		pointer(xpoint,ypoint){
			var point = new OpenLayers.Geometry.Point(xpoint, ypluspoint);
			var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, tempsegR, 36, 0);
			var featureCircle = new OpenLayers.Feature.Vector(myCircle);
		},
		drawMainMarker() {
			markers = new OpenLayers.Layer.Markers("Markers");
			map.addLayer(markers);

			var size = new OpenLayers.Size(21, 25);
			var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
			var icon = new OpenLayers.Icon(mapmarkerpng, size, offset);
			markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(this.lat, this.log), icon));

			var markerindex = {
				markerincalamity: this.calcount,
				markersX: this.lat,
				markersY: this.log

			}
			this.markerFeatures.push(markerindex);
			markers.events.register("click", markers, function (e) {
				var calId = 0;
				var calamityradius = 0;
				var calmainlat = 0;
				var calmainlog = 0;
				var calNumber = 0;
				var caladate = '';
				var i
				for (i = 0; i < calamityList.length; i++) {
					if (calamityList[i].mainlat == e.object.markers[0].lonlat.lon & calamityList[i].mainlog == e.object.markers[0].lonlat.lat) {
						calId = calamityList[i].calId
						calamityradius = calamityList[i].mainradius
						calmainlat = calamityList[i].mainlat
						calmainlog = calamityList[i].mainlog
						calNumber = calamityList[i].calcount
						caladate = calamityList[i].calDate
						break;
					}
				}
				EventBus.$emit("calamity-test", calamityAllinfo)
				uuidFeatures = new Array() //유저 배열

			});
		},

		drawUUID(uuidFeatureList) {

			map.addLayer(userMarkers);
			var size = new OpenLayers.Size(this.$store.state.markerSize, this.$store.state.markerSize);
			var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
			var icon = new OpenLayers.Icon(peoplesCircle, size, offset);

			userMarkers.clearMarkers()
			if (null != userMarkers.markers) {
				for (; 0 < userMarkers.markers;) {
					userMarkers.removeMarker(userMarkers.markers[0])
				}
			}

			for (var i = 0; i < uuidFeatureList.length; i++) {
				userMarkers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(uuidFeatureList[i].x, uuidFeatureList[i].y), icon));
				userMarkers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(uuidFeatureList[i].x, uuidFeatureList[i].y), icon.clone()));
			}
			
			
		},
		inputSegmentInList(calNum, latP, logP, segIdent) {
			this.segcount++
			var segcode = segIdent.split('_');
			
			var segmentIndex = {
				segNum: this.segcount,
				segId: segcode[3],
				callLevelIndex: this.level,
				calRadiusIndex: this.radius2,
				callTimeIndex: this.calDate,
				callatIndex: this.lat,
				callogIndex: this.log,
				calcount: this.calcount,
				mainType: this.type,
				calIndex: calNum,
				segLat: latP,
				segLog: logP,
				segmentfromcalamity: 0,
				segmentinsidepeople: 0,
				segmentUserList: []

			}
			//외부노출용 세그먼트번호

			var dis_x = this.lat - segmentIndex.segLat;
			var dix_y = this.log - segmentIndex.segLog;
			segmentIndex.segmentfromcalamity = Math.sqrt(Math.abs(dis_x * dis_x) + Math.abs(dix_y * dix_y))
			segmentList.push(segmentIndex)
		},
		
		apiSample(){
			// location = document.location.href;
    		// location = location.slice(0,-1)
			// location2 = location.substring(7)
			
    	this.locationList = [];
		var port = location.port;
		// this.currentIp = (document.location.href.slice(0,-6)).substring(7)
		this.currentIp = '158.181.17.81';
		try {		
			axios.get('http://'+this.currentIp+':'+port+'/region?region='+this.apilocation,
			// axios.get('http://'+this.currentIp + ':' + port+'/login',
          ).then((response) => {
			for(var i = 0 ; i< 5 ;i++){
		
				var locationindex = {
					mainname : "",
					subaddress : "",
					x : "",
					y : ""
				}
				if(response.data.search.contents.poi.length!=0){
				locationindex.mainname = response.data.search.contents.poi[i].name;
				locationindex.subaddress = response.data.search.contents.poi[i].roadAdres;
				locationindex.x = response.data.search.contents.poi[i].x;
				locationindex.y = response.data.search.contents.poi[i].y;
				
				this.locationList.push(locationindex);
				this.$refs.searchplace.open();
			
				}
				else{
					this.$refs.nosearchplace.open();
				}
			}
			}); 
		}catch (error) {
			consol.log(error)
		}
		   
		},
		
		apiMove(index){
			var center = new OpenLayers.LonLat(this.locationList[index].x, this.locationList[index].y);
			map.setCenter(center,5)

			markers = new OpenLayers.Layer.Markers("Markers");
			map.addLayer(markers);

			var size = new OpenLayers.Size(21, 25);
			var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
			var icon = new OpenLayers.Icon(mapmarkerpng, size, offset);
			markers.addMarker(new OpenLayers.Marker(center, icon));

			this.$refs.searchplace.close();
	
			
		},
		apiclose(){
			this.$refs.searchplace.close();
		},

		deleteF() {
			vectorLayer.removeAllFeatures();
			segmentLayer.removeAllFeatures();
			centerlayer.removeAllFeatures();
			calamityList = new Array() //재난 배열 
			segmentList = new Array() //세그먼트 배열
			segmentFeatures = new Array() //세그먼트의 feature(polygon)
			
			segmentLayer = "";
			vectorLayer = "";
			centerlayer="";
		},
		updateTime() {
			setInterval(()=>{
			var cd = new Date();
			this.time = this.zeroPadding(cd.getHours(), 2) + ':' + this.zeroPadding(cd.getMinutes(), 2) + ':' + this.zeroPadding(cd.getSeconds(), 2);
			this.date = this.zeroPadding(cd.getFullYear(), 4) + '-' + this.zeroPadding(cd.getMonth()+1, 2) + '-' + this.zeroPadding(cd.getDate(), 2) + ' ' + this.week[cd.getDay()];
			this.segmentR = this.$store.state.segmentR;
			this.markerXsize = this.$store.state.markerSize;
			this.calaAuto = this.$store.state.calaAuto;
			
			
			},1000)
		},
		zeroPadding(num, digit) {
			var zero = '';
			for(var i = 0; i < digit; i++) {
				zero += '0';
			}
			return (zero + num).slice(-digit);
		},
		reset(){
		
		},
		changesatellite(){
		
			if(map._getMapMode()==9){
				map._setMapMode(0);
			}
			else{
				map._setMapMode(9);
			}
			
		},
		gotoDaegu(){
		var center = new OpenLayers.LonLat(1099363.79652, 1764427.68399);
		map.setCenter(center,5)
		
		}
	},
	beforeDestroy(){
    EventBus.$off('start:spinner');
    EventBus.$off('end:spinner');
  },
}
</script>

<style scoped>
#map1 {
 width:100%;
 height:650px;
 position:relative;
 border: 0px solid #bcbcbc;
}

#textcontainer {
  display: flex;
}
#textal {
  float: left;
}
#clear-element {
  clear: both; /* or left */
}

.olControlNoSelect {
	margin-left: 50%;

}
.ngiimap_mapmodebox{
	width: 230px;
    height: 105px;
    position: absolute;
    top: 500px;
    z-index: 8000;
    left: 1%;
}
/**
 * Layer switcher
 */
.olControlLayerSwitcher {
    position: absolute;
    top: 25px;
    right: 0;
    width: 20em;
    font-family: sans-serif;
    font-weight: bold;
    margin-top: 3px;
    margin-left: 3px;
    margin-bottom: 3px;
    font-size: smaller;
    color: white;
    background-color: #303a59 !important;
}

.olControlLayerSwitcher .layersDiv {
    padding-top: 5px;
    padding-left: 10px;
    padding-bottom: 5px;
    padding-right: 10px;
    background-color: #303a59 !important;
}

.olControlLayerSwitcher .layersDiv .baseLbl,
.olControlLayerSwitcher .layersDiv .dataLbl {
    margin-top: 3px;
    margin-left: 3px;
    margin-bottom: 3px;
}

.olControlLayerSwitcher .layersDiv .baseLayersDiv,
.olControlLayerSwitcher .layersDiv .dataLayersDiv {
    padding-left: 10px;
}

.olControlLayerSwitcher .maximizeDiv,
.olControlLayerSwitcher .minimizeDiv {
    width: 18px;
    height: 18px;
    top: 5px;
    right: 0;
    cursor: pointer;
}

.olBingAttribution {
    color: #DDD;
}
.olBingAttribution.road {
    color: #333;
}

.olGoogleAttribution.hybrid, .olGoogleAttribution.satellite {
    color: #EEE;
}
.olGoogleAttribution {
    color: #333;
}
span.olGoogleAttribution a {
    color: #77C;
}
span.olGoogleAttribution.hybrid a, span.olGoogleAttribution.satellite a {
    color: #EEE;
}
</style>