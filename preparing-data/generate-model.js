const fs = require('fs'),
  moment = require('moment');

//parseShipsHistory()
//parseAnchors();

parseCsvToFinalJson();


function parseShipsHistory(){
  fs.readFile('navios.json', 'utf8', (err, anchors) => {
    anchors = JSON.parse(anchors);
    anchors = anchors.DATA_RECORD
      .map((anchor) => {
        return {
          BERTH_WINDOW : moment(anchor.BERTH_WINDOW, "YYYY/MM/DD HH:mm:ss").unix(),
          CHEGADA_BARRA : moment(anchor.CHEGADA_BARRA, "YYYY/MM/DD HH:mm:ss").unix(),
          ESCA_DTHR_ATRACACAO : moment(anchor.ESCA_DTHR_ATRACACAO, "YYYY/MM/DD HH:mm:ss").unix(),
          DESATRACACAO : moment(anchor.DESATRACACAO, "YYYY/MM/DD HH:mm:ss").unix(),
          NAVI_NOME: anchor.NAVI_NOME,
          SERVICO: anchor.SERVICO,
          LINER: anchor.LINER,
          BERCO_ATRACACAO: anchor.BERCO_ATRACACAO,
          BERTH_WINDOW_STATUS : anchor.CHEGADA_BARRA <= anchor.BERTH_WINDOW + (3600*6) ? 'IN' : 'OUT'
        };
      })      

    fs.writeFile('anchors.json', JSON.stringify(anchors))
  })
  
}

function parseAnchors(){
  fs.readFile('lista_atracacao.json', 'utf8', (err, anchors) => {
    anchors = JSON.parse(anchors);
    anchors = anchors
      .map((anchor) => {

        anchor.dtBerthWindowUnix = moment(anchor.dtBerthWindow, 'YYYY/MM/DD HH:mm:ss').unix();
        anchor.dtPrevistaBarraUnix = moment(anchor.dtPrevistaBarra, 'YYYY/MM/DD HH:mm:ss').unix();
        anchor.dtPrevisaoAtracacaoUnix = moment(anchor.dtPrevisaoAtracacao, 'YYYY/MM/DD HH:mm:ss').unix();
        anchor.dtPrevistaDesatracacaoUnix = moment(anchor.dtPrevistaDesatracacao, 'YYYY/MM/DD HH:mm:ss').unix();

        return anchor;        
      });

    fs.writeFile('anchors_list.json', JSON.stringify(anchors))
  })  
}

function parseCsvToFinalJson(){
  fs.readFile('2017-2018-2019.json', 'utf8', (err, anchors) => {
    anchors = JSON.parse(anchors);
    anchors = anchors
      .map((anchor) => {

        return {
          BERTH_WINDOW : moment(anchor.berth_window, "DD/MM/YYYY HH:mm:ss").unix(),
          CHEGADA_BARRA : moment(anchor.ata, "DD/MM/YYYY HH:mm:ss").unix(),
          ESCA_DTHR_ATRACACAO : moment(anchor.atb, "DD/MM/YYYY HH:mm:ss").unix(),
          DESATRACACAO : moment(anchor.ats, "DD/MM/YYYY HH:mm:ss").unix(),
          NAVI_NOME: anchor.vessel,
          SERVICO: anchor.service,
          LINER: anchor.liner,
          BERCO_ATRACACAO: 'BTP ' + anchor.berth,
          BERTH_WINDOW_STATUS : anchor.berth_status
        }

        return anchor;        
      })
      .filter(anchor => anchor.BERTH_WINDOW)

    fs.writeFile('anchors-2017-2018-2019.json', JSON.stringify(anchors))
  })  

}



