<template>
<div>
	<div style="display: flex; flex-direction: row; justify-content:space-between;">
		<button @click="reset" class="boxTitle" align="left">재난발생 위치</button>
		<h5 class="textal" align="center">네트워크상태 : {{ this.$store.getters.getStatus }}</h5>
		<h5 class="textal" align="right">현재 시간:{{date}} {{time}}</h5>
		</div>
		
	<div id="map1">
		<div id="mouse-position"></div>
		<div style="position:absolute;top:520px;right:10px;width:54px;height:100px;z-index:1000000;">
		</div>
	</div>
</div>
</template>

<script>
import {
	store
} from '../store/index.js';
import {
	defaults
} from 'ol/control';
import {
	EventBus
} from "./event-bus";
import mapmarkerpng from "../assets/mapmarker.png"
import peoplesCircle from "../assets/peoplesCircle.png"


let map = ''
let markers = ''
let popup = ''
let calamityList = new Array() //재난 배열 
let uuidFeatures = new Array() //유저 배열
let segmentList = new Array() //세그먼트 배열
let segmentRadius = 100 //세그먼트 반지름 
let segmentFeatures = new Array() //세그먼트의 feature(polygon)
let userMarkers = "";
let segmentLayer = "";
let vectorLayer = "";
let count = 0;
export default {

	props: ['pointX', 'pointY', 'radius', 'calLevel'],

	data() {
		return {
			
			network : '',
			message: '',
			point: '',
			calDate: '',
			lat: 0,
			log: 0,
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
			green_style: {
				strokeColor: 'green',
				strokeOpacity: 1,
				strokeWidth: 3,
				fillOpacity: 0.4,
				fillColor: "green"
			},
			segment_style: {
				strokeColor: 'black',
				strokeOpacity: 0.1,
				strokeWidth: 1,
				fillOpacity: 0.1,
				fillColor: "${black}"
			}, //세그먼트 Style

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
			timerID : setInterval(this.updateTime, 1000)
			//x 증가율 radius * 171.5
			//y 증가율 radius * 3
		}
	},
	created() {
		//여기는 재난이 들어오는 곳 
		EventBus.$on('use-eventbus', calIndex => {
			if (count != 0) {
				this.deleteF();
			}
			this.lat = calIndex.lat * 1;
			this.log = calIndex.log * 1;
			this.radius2 = calIndex.radius * 1;
			this.level = calIndex.callevel + "";
			this.calDate = calIndex.calTime;
			this.type = calIndex.calType;
			this.message = calIndex.context;

			switch (this.level) {
				case "1":
					vectorLayer = new OpenLayers.Layer.Vector("Overlay", {
						styleMap: new OpenLayers.StyleMap(
							this.standard_style
						)
					});
					break;
				case "2":
					vectorLayer = new OpenLayers.Layer.Vector("Overlay", {
						styleMap: new OpenLayers.StyleMap(
							this.orange_style
						)
					});
					break;
				case "3":
					vectorLayer = new OpenLayers.Layer.Vector("Overlay", {
						styleMap: new OpenLayers.StyleMap(
							this.yellow_style
						)
					});
					break;
				case "4":
					vectorLayer = new OpenLayers.Layer.Vector("Overlay", {
						styleMap: new OpenLayers.StyleMap(
							this.green_style
						)
					});
					break;
			}

			segmentLayer = new OpenLayers.Layer.Vector("segmentlay", {
				styleMap: new OpenLayers.StyleMap(
					this.segment_style
				)
			});
			this.drawMainCircle();
			//this.drawMainMarker();
			count++;
		});
		EventBus.$on('use-eventbus-uuidTest', uuidList => {
			this.uuidCount += 1
			uuidFeatures = new Array();
			for (var i = 0; i < uuidList.length; i++) {
				var uuidindex = {
					x: uuidList[i].uuidX,
					y: uuidList[i].uuidY,
					uuidcontainCal: 0,
					uuidcontainseg: -1,
					uuid: uuidList[i].uuidId
				}
				uuidFeatures.push(uuidindex);
			}

			this.drawUUID(uuidFeatures);
		});

	},
	mounted() {
		this.updateTime();
		this.init();
	},
	computed: {},
	methods: {
		reset(){
			this.deleteF();
		},

		init() {
			map = new ngii_wmts.map("map1", {
				controls: [],
				projection: "EPSG:5179",
				center: new OpenLayers.LonLat(1099472.79652, 1764427.68399),
				zoom: 7,
				numZoomLevels: 21,
				eventListeners: {
					featureclick: function (e) {
						console.log(e)
						if (e.feature.layer.name == 'segmentlay') {
							e.feature.renderIntent = "select";
							var j = 0;
							for (j = 0; j < segmentList.length; j++) {
								if (segmentList[j].segId == e.feature.id) {
									//해당 세그먼트에 몇명이 있는지 확인 
									if (popup) {
										map.removePopup(popup)
									}
									var segcode = e.feature.id.split('_');
									var countuuid = 0;

									for (var l = 0; l < uuidFeatures.length; l++) {

										if (uuidFeatures[l].uuidcontainseg == segmentList[j].segId)
											countuuid++
									}
									var popuplocation = new OpenLayers.LonLat(segmentList[j].segLat, segmentList[j].segLog)
									popup = new OpenLayers.Popup("chicken",
										popuplocation,
										new OpenLayers.Size(200, 60),
										"세그먼트 번호 :" + segcode[3] + "<br>" + '<div style="color:#FF0000">포함 인원 :   ' + countuuid + "명", true);

									map.addPopup(popup);

								}
							}
						}
					}

				}
			});

			//지도 객체 생성 
			map.addControl(new OpenLayers.Control.PanZoomBar());
			map.addControl(new OpenLayers.Control.MousePosition());
			map.addControl(new OpenLayers.Control.OverviewMap());
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


			//map.controls[1].disableZoomWheel(); // disable the original behavior of

			//create a new control//

			var mousewheel = new OpenLayers.Control();
			OpenLayers.Util.extend(mousewheel, {
				// The draw method is called when the control is initialized
				draw: function () {
					this.mouse = new OpenLayers.Handler.MouseWheel(mousewheel, {
						"up": mouseUp,
						"down": mouseDown
					});
					this.mouse.activate();
				}
			});

			//add new control
			map.addControl(mousewheel);
			// change behavior of mouse wheel functions
			function mouseUp() {
				map.zoomTo(map.zoom + 1);
			}

			function mouseDown() {
				if (map.zoom > 10) {
					map.zoomTo(map.zoom - 1);
				}
			}

			userMarkers = new OpenLayers.Layer.Markers("userMarkers");

		},

		drawMainCircle() {
			var x = this.lat;
			var y = this.log;
			var length = 0;
			var count = 0;
			//가장 큰 재난 원 
			var point = new OpenLayers.Geometry.Point(x, y);
			var mainCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, this.radius2, 36, 0);
			var mainFeature = new OpenLayers.Feature.Vector(mainCircle);
			console.log("Map says: " + mainFeature.id);
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
			var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, segmentRadius, 36, 0);
			var featureCircle = new OpenLayers.Feature.Vector(myCircle);
			segmentLayer.addFeatures(featureCircle)
			this.inputSegmentInList(mainFeature.id, x, y, featureCircle.id)
			segmentFeatures.push(featureCircle)

			var ycount = 0
			while (true) {
				if (ycount == 0) {
					while (true) {
						length += 171.5;
						//늘어나는 길이가 루트3만큼 늘어난다.
						var point = new OpenLayers.Geometry.Point(x + length, this.log);
						var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, segmentRadius, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(myCircle);
						if (!myCircle.intersects(mainCircle)) break;
						segmentLayer.addFeatures(featureCircle)
						this.inputSegmentInList(mainFeature.id, x + length, this.log, featureCircle.id)
						segmentFeatures.push(featureCircle)
						//this.inputSegmentInList(this.calcount,x + length,this.log)
						var minuspoint = new OpenLayers.Geometry.Point(x - length, this.log);
						var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, segmentRadius, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
						segmentLayer.addFeatures(featureCircle)
						this.inputSegmentInList(mainFeature.id, x - length, this.log, featureCircle.id)
						segmentFeatures.push(featureCircle)
						//this.inputSegmentInList(this.calcount,x - length,this.log)
					} //기본이 되는 선을 하나 그린다.
					ycount = 1;
					length = 0;
				} else {
					y += 300
					var point = new OpenLayers.Geometry.Point(x, y);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, segmentRadius, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);

					if (!myCircle.intersects(mainCircle)) break;
					//리스트에 집어 넣기
					segmentLayer.addFeatures(featureCircle)
					this.inputSegmentInList(mainFeature.id, x, y, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var reverseY = this.log - (y - this.log)
					var minuspoint = new OpenLayers.Geometry.Point(x, reverseY);
					var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, segmentRadius, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
					segmentLayer.addFeatures(featureCircle)

					this.inputSegmentInList(mainFeature.id, x, reverseY, featureCircle.id)
					segmentFeatures.push(featureCircle)
					ycount++
					//y축으로 +- 를 쫙 그리고 
					while (true) {
						//그 y축을 가지고 x축을 그린다.
						length += 171.5;
						var point = new OpenLayers.Geometry.Point(x + length, y);
						var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, segmentRadius, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(myCircle);
						if (!mainCircle.intersects(myCircle)) break;
						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, x + length, y, featureCircle.id)
						segmentFeatures.push(featureCircle)
						var minuspoint = new OpenLayers.Geometry.Point(x - length, y);
						var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, segmentRadius, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, x - length, y, featureCircle.id)
						segmentFeatures.push(featureCircle)
						var point = new OpenLayers.Geometry.Point(x + length, reverseY);
						var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, segmentRadius, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(myCircle);

						segmentLayer.addFeatures(featureCircle)
						this.inputSegmentInList(mainFeature.id, x + length, reverseY, featureCircle.id)
						segmentFeatures.push(featureCircle)
						var minuspoint = new OpenLayers.Geometry.Point(x - length, reverseY);
						var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, segmentRadius, 36, 0);
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
			var ylength = 150;
			var count = 0;

			while (true) {
				if (count == 0) {
					var point2 = new OpenLayers.Geometry.Point(x + (171.5 / 2), y + 150);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point2, segmentRadius, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);

					if (!myCircle.intersects(mainCircle)) break;
					segmentLayer.addFeatures(featureCircle)

					this.inputSegmentInList(mainFeature.id, x + (171.5 / 2), y + 150, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var point3 = new OpenLayers.Geometry.Point(x - (171.5 / 2), y + 150);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point3, segmentRadius, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);
					segmentLayer.addFeatures(featureCircle)
					this.inputSegmentInList(mainFeature.id, x - (171.5 / 2), y + 150, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var point2 = new OpenLayers.Geometry.Point(x + (171.5 / 2), y - 150);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point2, segmentRadius, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);
					segmentLayer.addFeatures(featureCircle)
					this.inputSegmentInList(mainFeature.id, x + (171.5 / 2), y - 150, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var point3 = new OpenLayers.Geometry.Point(x - (171.5 / 2), y - 150);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point3, segmentRadius, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);
					segmentLayer.addFeatures(featureCircle)
					this.inputSegmentInList(mainFeature.id, x - (171.5 / 2), y - 150, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var ypluspoint = y + ylength
					var yminuspoint = y - ylength
					var plusx = x + (171.5 / 2);
					var minusx = x - (171.5 / 2);
					while (true) {
						//그 y축을 가지고 x축을 그린다.
						length += 171.5;
						var point = new OpenLayers.Geometry.Point(plusx + length, ypluspoint);
						var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, segmentRadius, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(myCircle);
						if (!mainCircle.intersects(myCircle)) break;
						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, plusx + length, ypluspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)
						var minuspoint = new OpenLayers.Geometry.Point(minusx - length, ypluspoint);
						var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, segmentRadius, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, minusx - length, ypluspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)
						var point = new OpenLayers.Geometry.Point(plusx + length, yminuspoint);
						var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, segmentRadius, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(myCircle);

						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, plusx + length, yminuspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)
						var minuspoint = new OpenLayers.Geometry.Point(minusx - length, yminuspoint);
						var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, segmentRadius, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, minusx - length, yminuspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)
					}
					length = 0;


					count++;
				} else {
					ylength += 300
					var point2 = new OpenLayers.Geometry.Point(x + (171.5 / 2), y + ylength);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point2, segmentRadius, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);

					if (!myCircle.intersects(mainCircle)) break;
					segmentLayer.addFeatures(featureCircle)

					this.inputSegmentInList(mainFeature.id, x + (171.5 / 2), y + ylength, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var point3 = new OpenLayers.Geometry.Point(x - (171.5 / 2), y + ylength);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point3, segmentRadius, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);
					segmentLayer.addFeatures(featureCircle)
					this.inputSegmentInList(mainFeature.id, x - (171.5 / 2), y + ylength, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var point2 = new OpenLayers.Geometry.Point(x + (171.5 / 2), y - ylength);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point2, segmentRadius, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);
					segmentLayer.addFeatures(featureCircle)
					this.inputSegmentInList(mainFeature.id, x + (171.5 / 2), y - ylength, featureCircle.id)
					segmentFeatures.push(featureCircle)

					var point3 = new OpenLayers.Geometry.Point(x - (171.5 / 2), y - ylength);
					var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point3, segmentRadius, 36, 0);
					var featureCircle = new OpenLayers.Feature.Vector(myCircle);
					segmentLayer.addFeatures(featureCircle)
					this.inputSegmentInList(mainFeature.id, x - (171.5 / 2), y - ylength, featureCircle.id)
					segmentFeatures.push(featureCircle)
					//대각선 위치에 있는 원 그리기 
					var ypluspoint = y + ylength
					var yminuspoint = y - ylength
					var plusx = x + (171.5 / 2);
					var minusx = x - (171.5 / 2);
					while (true) {
						//그 y축을 가지고 x축을 그린다.
						length += 171.5;
						var point = new OpenLayers.Geometry.Point(plusx + length, ypluspoint);
						var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, segmentRadius, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(myCircle);
						if (!mainCircle.intersects(myCircle)) break;
						segmentLayer.addFeatures(featureCircle)
						this.inputSegmentInList(mainFeature.id, plusx + length, ypluspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)

						var minuspoint = new OpenLayers.Geometry.Point(minusx - length, ypluspoint);
						var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, segmentRadius, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
						segmentLayer.addFeatures(featureCircle)

						this.inputSegmentInList(mainFeature.id, minusx - length, ypluspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)
						var point = new OpenLayers.Geometry.Point(plusx + length, yminuspoint);
						var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, segmentRadius, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(myCircle);
						segmentLayer.addFeatures(featureCircle)
						this.inputSegmentInList(mainFeature.id, plusx + length, yminuspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)

						var minuspoint = new OpenLayers.Geometry.Point(minusx - length, yminuspoint);
						var minusmyCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(minuspoint, segmentRadius, 36, 0);
						var featureCircle = new OpenLayers.Feature.Vector(minusmyCircle);
						segmentLayer.addFeatures(featureCircle)
						this.inputSegmentInList(mainFeature.id, minusx - length, yminuspoint, featureCircle.id)
						segmentFeatures.push(featureCircle)
					}
					length = 0;
				}
			}

			map.addLayer(vectorLayer);
			map.addLayer(segmentLayer);
			var pointZoom = new OpenLayers.LonLat(this.lat, this.log)
			map.setCenter(pointZoom, 8)
		
				var segmentSendingList = [];
				var countall = 0;
				var countsub = 0;
			for (var k = 0; k < uuidFeatures.length; k++) {
			uuidFeatures[k].uuidcontainseg =-1;
			}

				
				for (var j = 0; j < segmentFeatures.length; j++) {
					if (segmentList[j].calIndex == calamityIndex.calId) {
						// Polygon 안에 들어있는지 안들어있는지 판단하는 조건문
						for (var k = 0; k < uuidFeatures.length; k++) {
							var p = new OpenLayers.Geometry.Point(uuidFeatures[k].x, uuidFeatures[k].y);

							if (segmentFeatures[j].geometry.intersects(p)) {
								countall++;
								if (uuidFeatures[k].uuidcontainseg == -1) {
									segmentList[j].segmentUserList.push(uuidFeatures[k].uuid)
									uuidFeatures[k].uuidcontainseg = segmentList[j].segId;
									segmentSendingList.push(segmentList[j])
								} 
								
								else if (uuidFeatures[k].uuidcontainseg != -1) {
									for (var h = 0; h < segmentList.length; h++) {
										if (segmentList[h].segId == uuidFeatures[k].uuidcontainseg) {
											//원래 들어있던게 다를 경우 
											if (segmentList[j].segmentfromcalamity <= segmentList[h].segmentfromcalamity) {
												uuidFeatures[k].uuidcontainseg = segmentList[j].segId;
												countsub++;
											}
										}
									}
								}
							}
						}
					}
				}

				

				var calamityAllinfo = {
					targetUser: 0,
					dangerUser: 0,
					littledangerUser: 0,
					normalUser: 0,
					safeUser: 0,
					callat: calamityIndex.mainlat,
					callon: calamityIndex.mainlog,
					caldate: this.calDate,
					callevel: this.level,
					calType: calamityIndex.mainType,
					calNumber: this.calcount,
					calMessageInfo: calamityIndex.calmessage,
					uuidAllInfo: uuidFeatures,
					segmentSendingFeature: segmentSendingList
				}
				EventBus.$emit("calamity-test", calamityAllinfo)
			

		},
		pointer(xpoint,ypoint){
			var point = new OpenLayers.Geometry.Point(xpoint, ypluspoint);
			var myCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, segmentRadius, 36, 0);
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

			var size = new OpenLayers.Size(10, 10);
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
			map.addLayer(userMarkers);
		},
		inputSegmentInList(calNum, latP, logP, segIdent) {
			this.segcount++
			var segmentIndex = {
				segNum: this.segcount,
				segId: segIdent,
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
				segmentUserList: []
			}
			//외부노출용 세그먼트번호

			var dis_x = this.lat - segmentIndex.segLat;
			var dix_y = this.log - segmentIndex.segLog;
			segmentIndex.segmentfromcalamity = Math.sqrt(Math.abs(dis_x * dis_x) + Math.abs(dix_y * dix_y))
			segmentList.push(segmentIndex)
		},
		deleteF() {
			vectorLayer.removeAllFeatures();
			segmentLayer.removeAllFeatures();
			calamityList = new Array() //재난 배열 
			segmentList = new Array() //세그먼트 배열
			segmentFeatures = new Array() //세그먼트의 feature(polygon)
			
			segmentLayer = "";
			vectorLayer = "";

		},
		updateTime() {
			var cd = new Date();
			this.time = this.zeroPadding(cd.getHours(), 2) + ':' + this.zeroPadding(cd.getMinutes(), 2) + ':' + this.zeroPadding(cd.getSeconds(), 2);
			this.date = this.zeroPadding(cd.getFullYear(), 4) + '-' + this.zeroPadding(cd.getMonth()+1, 2) + '-' + this.zeroPadding(cd.getDate(), 2) + ' ' + this.week[cd.getDay()];
		},
		zeroPadding(num, digit) {
			var zero = '';
			for(var i = 0; i < digit; i++) {
				zero += '0';
			}
			return (zero + num).slice(-digit);
		}
	}
}
</script>

<style>
#map1 {
 width:1538px;
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
</style>