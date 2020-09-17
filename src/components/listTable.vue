<template>
  <div class="bodybox">
    <div class="boxSet">
      <!--세로 스크롤만 있는 테이블임. 가로스크롤 필요시 연락바람. ...으로 줄임표시 해둠 -->
      <div class="fix-container-allborder" style="width:100%;height:200px;">
        <div class="header-bg"></div>
        <div class="table-wrapper">
          <table class="tablefix" style="table-layout:fixed;">
            <thead>
              <tr>
                <th style="width:80px;">
                  <div class="th-text">번호</div>
                </th>
                <th style="width:250px;">
                  <div class="th-text">재난발생일시</div>
                </th>
                <th style="width:200px;">
                  <div class="th-text">재난종류</div>
                </th>
                <th style="width:150px;">
                  <div class="th-text">재난단계</div>
                </th>
                <th style="width:200px;">
                  <div class="th-text">위도</div>
                </th>
                <th style="width:200px;">
                  <div class="th-text">경도</div>
                </th>
                <th style="width:100px;">
                  <div class="th-text">수신 성공(명)</div>
                </th>
                <th style="width:100px;">
                  <div class="th-text">수신 실패(명)</div>
                </th>
                <th style="width:200px;">
                  <div class="th-text">수신률(%)</div>
                </th>
                <th>
                  <div class="th-text" style="padding-left:10px;">자세히</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(info,index) in calamityList2" :key="index">
                <td class="txcenter">{{info.number}}</td>
                <td class="txcenter">{{info.calday}}</td>
                <td class="txcenter">{{info.calType}}</td>
                <td class="txcenter">{{info.calLev}}</td>
                <td>{{info.callat}}</td>
                <td>{{info.callon}}</td>
                <td class="txcenter">{{info.success}}</td>
                <td class="txcenter">{{info.fail}}</td>
                <td class="txcenter">{{info.rate}}</td>
                <td>
                  <v-btn height="25px" @click="onButtonClick(index)">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </td>
              </tr>
              <SweetModal width="75%" ref="modal" modal-theme="light" overlay-theme="dark" >
               <div class="popTitle"><span>선택 재난 상세 정보</span></div>
                <div class="modal-content">
                  <div class="modal-body">
                    <table style="width:100%">
                      <tr>
                        <td align="left" width="50px">
                          <h3>재난 위치</h3>
                          <div id="map2" style="width: 500px; height: 300px; display : inline-block;" class="map"></div>
                        </td>

                        <td align="left" width="300px">
                          <h3>재난 정보</h3>
                          <div background-color: lightblue>
                          <p> 재난번호 :{{calnumb}}</p>
                          <p> 위도 : {{callat2}}</p>
                          <p> 경도 : {{callon2}}</p>
                          <p> 단계 : {{callev2}}</p>
                          <p> 재난 종류 : {{calType2}}</p>
                          <p> 재난 발생 일시 : {{calDate2}}</p>
                          <p> 재난 범위 : {{calrange2}}m</p>
                        </div>
                        </td>

                        <td align="left">
                          <h3>재난 대상자 리스트</h3>
                          <div class="fix-container-allborder" style="width:100%;height:300px;">
                            <div class="header-bg"></div>
                            <div class="table-wrapper">
                              <table class="tablefix" style="table-layout:fixed;">
                                <thead>
                                  <tr>
                                    <th style="width:80px;">
                                      <div class="th-text">uuid</div>
                                    </th>
                                    <th style="width:250px;">
                                      <div class="th-text">세그먼트ID</div>
                                    </th>
                                    <th style="width:60px;">
                                      <div class="th-text"> 전송상태</div>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="(info2,index) in uuidshowList2" :key="index">
                                      <td v-if="info2.calNum==calnumb">{{info2.uuid}}</td>
                                      <td v-if="info2.calNum==calnumb">{{info2.segmentId}}</td>
                                      <td v-if="info2.calNum==calnumb">{{info2.mesageState}}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </SweetModal>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

import {EventBus} from "./event-bus";
import mapprograming from "./Map2"
import { SweetModal, SweetModalTab } from 'sweet-modal-vue'

let  map ='';
let vectorLayer = "";
let count = 0;
  export default {
    data () {
      return {
          count : 1,
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
        headers: [
          {
            text: '번호',
            align: 'start',
            sortable: false,
            value: 'number',
          },
          { text: '재난발생일시', value: 'calday' ,align:'center' },
          { text: '재난종류', value: 'calType' },
          { text: '위험단계', value: 'calLev' },
          { text: '위도', value: 'callat' },
          { text: '경도', value: 'callon' }, 
          { text: '수신완료', value: 'success' },
          { text: '미수신', value: 'fail' },
          { text: '수신율', value: 'rate'}
        ],
        calnumb :"",
        callat2 :0,
        callon2 :0,
        callev2 : "",
        calType2: "",
        calDate2:"",
        calrange2:"",
        calamityList2 : [],
        uuidshowList2: [],
      }
    }, 
  components: {
    SweetModal,
    SweetModalTab
  },created(){
      EventBus.$on('use-eventbus-calamityList', calamityList => {
      this.calamityList2=calamityList;
      console.log(this.calamityList2)
       })},
    mounted(){
      map =  new ngii_wmts.map("map2");
    },

  methods:{
    onButtonClick(index){
      this.$refs.modal.open();
      if (count != 0) {
				vectorLayer.removeAllFeatures();
      }
      this.calnumb = this.calamityList2[index].number;
      this.callat2 = this.calamityList2[index].callat;
      this.callon2 = this.calamityList2[index].callon;
      this.callev2 = this.calamityList2[index].calLev;
      this.calType2 = this.calamityList2[index].calType;
      this.calDate2 = this.calamityList2[index].calday;
      this.calrange2 = this.calamityList2[index].dangerRange;
      this.uuidshowList2 = this.calamityList2[index].uuidlists; 
      console.log(this.uuidshowList2)
      
        switch (this.calamityList2[index].calLev) {
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
							this.green_style
						)
					});
					break;
      } 
      

      var stringX=Number(this.calamityList2[index].callat)
      var stringY=Number(this.calamityList2[index].callon)
      var wgs84 = proj4('EPSG:4326','EPSG:5179', [stringX,stringY]);
      var pointX = wgs84[0]
      var pointY = wgs84[1]
    
      var point = new OpenLayers.Geometry.Point(pointX, pointY); 
			var mainCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point,this.calamityList2[index].dangerRange, 36, 0);
      var mainFeature = new OpenLayers.Feature.Vector(mainCircle);

			vectorLayer.addFeatures(mainFeature)      
      map.addLayer(vectorLayer);
      var pointZoom = new OpenLayers.LonLat(pointX, pointY)
      map.setCenter(pointZoom,7)
      count++;
    }, 

  },
}
</script>

<style>
#div.container{
  line-height: 50%;
}
#div.header{
clear:left
}
#div.footer{
clear:left
}
#div.left{
  float:left
}
#map2 {
    width:100%;
    height:500px;
}
</style>