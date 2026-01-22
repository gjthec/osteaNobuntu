import { BaseResourceModel } from "./baseResource.model"  
import { Paciente } from "./paciente.model"; 
import { FieldFile } from "./fieldFile.model"; 


export interface IAvaliacao extends BaseResourceModel { 
  paciente?: Paciente
  dataAvaliacao?: any
  tipo?: string
  localSintoma?: FieldFile
  sintomasAtuais?: string
  sintomasPresentesDesde?: string
  situacaoSintomas?: string
  sintomasResultado?: string
  sintomasInicio?: string
  localInicioSintomas?: string
  localSintomasConstantes?: string
  localSintomasIntermitentes?: string
  pioraAcao?: string
  pioraMomento?: string
  melhoraAcao?: string
  melhoraMomento?: string
  disturbioSono?: string
  travesseiro?: string
  posicaoDormir?: string
  tipoColchao?: string
  episodiosAnteriores?: string
  anoPrimeiroEpisodio?: number
  historiaPreviaColuna?: string
  tratamentosAnteriores?: string
  ocorreDor?: string
  funcionamentoBexiga?: string
  funcionamentoIntestino?: string
  modoAndar?: string
  medicacaoConsumida?: string
  complementoMedicacao?: string
  situacaoSaudeGeral?: string
  comorbidades?: string
  complementoSaudeGeral?: string
  historicoCancer?: string
  historicoTrauma?: string
  cirurgiaRecente?: string
  cirurgiaGrandePorte?: string
  complementoCirurgia?: string
  imagens?: string
  dorDuranteNoite?: string
  acidentes?: string
  perdaInexplicavelPeso?: string
  outrosRelatos?: string
  objetivosExpectativas?: string
  posturaSentada?: string
  mudancaPostura?: string
  posturaEmPe?: string
  posturaLateralShifi?: string
  desvioRelevante?: string
  observacaoPostura?: string
  deficitMotor?: string
  reflexos?: string
  deficitSensorial?: string
  sinaisDura?: string
  perdaMovFlexao?: string
  sintomaFlexao?: string
  perdaMovExtensao?: string
  sintomaExtensao?: string
  perdaMovDeslocLatDir?: string
  sintomaDeslocLatDir?: string
  perdaMovDeslocLatEsq?: string
  sintomaDeslocLatEsq?: string
  perdaMovOutro?: string
  sintomaOutro?: string
  sintomasPreTesteEmPe?: string
  sintomasPreTesteFEP?: string
  sintomasPreTesteFEPRep?: string
  sintomasPosTesteFEPRep?: string
  sintomasPreTesteEEP?: string
  sintomasPreTesteEEPRep?: string
  sintomasPosTesteEEPRep?: string
  sintomasPreTesteDeitado?: string
  sintomasPreTesteFD?: string
  sintomasPreTesteFDRep?: string
  sintomasPreTesteED?: string
  sintomasPreTesteEDRep?: string
  sintomasPosTesteEDRep?: string
  sintomasPreTeste?: string
  sintomasPreTesteDLEPD?: string
  sintomasPreTesteDLEPDRep?: string
  sintomasPreTesteDLEPE?: string
  sintomasPreTesteDLEPERep?: string
  sintomasPosTesteDLEPERep?: string
  sintomasPreTesteOutrosMovi?: string
  sintomasPosTesteOutrosMovi?: string
  testeSentar?: string
  testeSentarComplemento?: string
  outrosTestes?: string
  derangement?: string
  direcionalPreference?: string
  dysfunction?: string
  outrosSubgrupo?: string
  fatoresCondDorIncapa?: string
  educacao?: string
  tipoExercicio?: string
  equipamentoIndicado?: string
  principioExtensao?: string
  principioLateral?: string
  principioFlexao?: string
  outrosExerciciosInterv?: string
  frequencia?: string
  barreirasRecuperacao?: string
  objetivosTratamento?: string
} 
export class Avaliacao extends BaseResourceModel implements IAvaliacao{ 
  paciente?: Paciente
  dataAvaliacao?: any
  tipo?: string
  localSintoma?: FieldFile
  sintomasAtuais?: string
  sintomasPresentesDesde?: string
  situacaoSintomas?: string
  sintomasResultado?: string
  sintomasInicio?: string
  localInicioSintomas?: string
  localSintomasConstantes?: string
  localSintomasIntermitentes?: string
  pioraAcao?: string
  pioraMomento?: string
  melhoraAcao?: string
  melhoraMomento?: string
  disturbioSono?: string
  travesseiro?: string
  posicaoDormir?: string
  tipoColchao?: string
  episodiosAnteriores?: string
  anoPrimeiroEpisodio?: number
  historiaPreviaColuna?: string
  tratamentosAnteriores?: string
  ocorreDor?: string
  funcionamentoBexiga?: string
  funcionamentoIntestino?: string
  modoAndar?: string
  medicacaoConsumida?: string
  complementoMedicacao?: string
  situacaoSaudeGeral?: string
  comorbidades?: string
  complementoSaudeGeral?: string
  historicoCancer?: string
  historicoTrauma?: string
  cirurgiaRecente?: string
  cirurgiaGrandePorte?: string
  complementoCirurgia?: string
  imagens?: string
  dorDuranteNoite?: string
  acidentes?: string
  perdaInexplicavelPeso?: string
  outrosRelatos?: string
  objetivosExpectativas?: string
  posturaSentada?: string
  mudancaPostura?: string
  posturaEmPe?: string
  posturaLateralShifi?: string
  desvioRelevante?: string
  observacaoPostura?: string
  deficitMotor?: string
  reflexos?: string
  deficitSensorial?: string
  sinaisDura?: string
  perdaMovFlexao?: string
  sintomaFlexao?: string
  perdaMovExtensao?: string
  sintomaExtensao?: string
  perdaMovDeslocLatDir?: string
  sintomaDeslocLatDir?: string
  perdaMovDeslocLatEsq?: string
  sintomaDeslocLatEsq?: string
  perdaMovOutro?: string
  sintomaOutro?: string
  sintomasPreTesteEmPe?: string
  sintomasPreTesteFEP?: string
  sintomasPreTesteFEPRep?: string
  sintomasPosTesteFEPRep?: string
  sintomasPreTesteEEP?: string
  sintomasPreTesteEEPRep?: string
  sintomasPosTesteEEPRep?: string
  sintomasPreTesteDeitado?: string
  sintomasPreTesteFD?: string
  sintomasPreTesteFDRep?: string
  sintomasPreTesteED?: string
  sintomasPreTesteEDRep?: string
  sintomasPosTesteEDRep?: string
  sintomasPreTeste?: string
  sintomasPreTesteDLEPD?: string
  sintomasPreTesteDLEPDRep?: string
  sintomasPreTesteDLEPE?: string
  sintomasPreTesteDLEPERep?: string
  sintomasPosTesteDLEPERep?: string
  sintomasPreTesteOutrosMovi?: string
  sintomasPosTesteOutrosMovi?: string
  testeSentar?: string
  testeSentarComplemento?: string
  outrosTestes?: string
  derangement?: string
  direcionalPreference?: string
  dysfunction?: string
  outrosSubgrupo?: string
  fatoresCondDorIncapa?: string
  educacao?: string
  tipoExercicio?: string
  equipamentoIndicado?: string
  principioExtensao?: string
  principioLateral?: string
  principioFlexao?: string
  outrosExerciciosInterv?: string
  frequencia?: string
  barreirasRecuperacao?: string
  objetivosTratamento?: string
  constructor(input: IAvaliacao){
    super();
    this.id = input.id;
    this.paciente = input.paciente;
    this.dataAvaliacao = input.dataAvaliacao;
    this.tipo = input.tipo;
    this.localSintoma = input.localSintoma;
    this.sintomasAtuais = input.sintomasAtuais;
    this.sintomasPresentesDesde = input.sintomasPresentesDesde;
    this.situacaoSintomas = input.situacaoSintomas;
    this.sintomasResultado = input.sintomasResultado;
    this.sintomasInicio = input.sintomasInicio;
    this.localInicioSintomas = input.localInicioSintomas;
    this.localSintomasConstantes = input.localSintomasConstantes;
    this.localSintomasIntermitentes = input.localSintomasIntermitentes;
    this.pioraAcao = input.pioraAcao;
    this.pioraMomento = input.pioraMomento;
    this.melhoraAcao = input.melhoraAcao;
    this.melhoraMomento = input.melhoraMomento;
    this.disturbioSono = input.disturbioSono;
    this.travesseiro = input.travesseiro;
    this.posicaoDormir = input.posicaoDormir;
    this.tipoColchao = input.tipoColchao;
    this.episodiosAnteriores = input.episodiosAnteriores;
    this.anoPrimeiroEpisodio = input.anoPrimeiroEpisodio;
    this.historiaPreviaColuna = input.historiaPreviaColuna;
    this.tratamentosAnteriores = input.tratamentosAnteriores;
    this.ocorreDor = input.ocorreDor;
    this.funcionamentoBexiga = input.funcionamentoBexiga;
    this.funcionamentoIntestino = input.funcionamentoIntestino;
    this.modoAndar = input.modoAndar;
    this.medicacaoConsumida = input.medicacaoConsumida;
    this.complementoMedicacao = input.complementoMedicacao;
    this.situacaoSaudeGeral = input.situacaoSaudeGeral;
    this.comorbidades = input.comorbidades;
    this.complementoSaudeGeral = input.complementoSaudeGeral;
    this.historicoCancer = input.historicoCancer;
    this.historicoTrauma = input.historicoTrauma;
    this.cirurgiaRecente = input.cirurgiaRecente;
    this.cirurgiaGrandePorte = input.cirurgiaGrandePorte;
    this.complementoCirurgia = input.complementoCirurgia;
    this.imagens = input.imagens;
    this.dorDuranteNoite = input.dorDuranteNoite;
    this.acidentes = input.acidentes;
    this.perdaInexplicavelPeso = input.perdaInexplicavelPeso;
    this.outrosRelatos = input.outrosRelatos;
    this.objetivosExpectativas = input.objetivosExpectativas;
    this.posturaSentada = input.posturaSentada;
    this.mudancaPostura = input.mudancaPostura;
    this.posturaEmPe = input.posturaEmPe;
    this.posturaLateralShifi = input.posturaLateralShifi;
    this.desvioRelevante = input.desvioRelevante;
    this.observacaoPostura = input.observacaoPostura;
    this.deficitMotor = input.deficitMotor;
    this.reflexos = input.reflexos;
    this.deficitSensorial = input.deficitSensorial;
    this.sinaisDura = input.sinaisDura;
    this.perdaMovFlexao = input.perdaMovFlexao;
    this.sintomaFlexao = input.sintomaFlexao;
    this.perdaMovExtensao = input.perdaMovExtensao;
    this.sintomaExtensao = input.sintomaExtensao;
    this.perdaMovDeslocLatDir = input.perdaMovDeslocLatDir;
    this.sintomaDeslocLatDir = input.sintomaDeslocLatDir;
    this.perdaMovDeslocLatEsq = input.perdaMovDeslocLatEsq;
    this.sintomaDeslocLatEsq = input.sintomaDeslocLatEsq;
    this.perdaMovOutro = input.perdaMovOutro;
    this.sintomaOutro = input.sintomaOutro;
    this.sintomasPreTesteEmPe = input.sintomasPreTesteEmPe;
    this.sintomasPreTesteFEP = input.sintomasPreTesteFEP;
    this.sintomasPreTesteFEPRep = input.sintomasPreTesteFEPRep;
    this.sintomasPosTesteFEPRep = input.sintomasPosTesteFEPRep;
    this.sintomasPreTesteEEP = input.sintomasPreTesteEEP;
    this.sintomasPreTesteEEPRep = input.sintomasPreTesteEEPRep;
    this.sintomasPosTesteEEPRep = input.sintomasPosTesteEEPRep;
    this.sintomasPreTesteDeitado = input.sintomasPreTesteDeitado;
    this.sintomasPreTesteFD = input.sintomasPreTesteFD;
    this.sintomasPreTesteFDRep = input.sintomasPreTesteFDRep;
    this.sintomasPreTesteED = input.sintomasPreTesteED;
    this.sintomasPreTesteEDRep = input.sintomasPreTesteEDRep;
    this.sintomasPosTesteEDRep = input.sintomasPosTesteEDRep;
    this.sintomasPreTeste = input.sintomasPreTeste;
    this.sintomasPreTesteDLEPD = input.sintomasPreTesteDLEPD;
    this.sintomasPreTesteDLEPDRep = input.sintomasPreTesteDLEPDRep;
    this.sintomasPreTesteDLEPE = input.sintomasPreTesteDLEPE;
    this.sintomasPreTesteDLEPERep = input.sintomasPreTesteDLEPERep;
    this.sintomasPosTesteDLEPERep = input.sintomasPosTesteDLEPERep;
    this.sintomasPreTesteOutrosMovi = input.sintomasPreTesteOutrosMovi;
    this.sintomasPosTesteOutrosMovi = input.sintomasPosTesteOutrosMovi;
    this.testeSentar = input.testeSentar;
    this.testeSentarComplemento = input.testeSentarComplemento;
    this.outrosTestes = input.outrosTestes;
    this.derangement = input.derangement;
    this.direcionalPreference = input.direcionalPreference;
    this.dysfunction = input.dysfunction;
    this.outrosSubgrupo = input.outrosSubgrupo;
    this.fatoresCondDorIncapa = input.fatoresCondDorIncapa;
    this.educacao = input.educacao;
    this.tipoExercicio = input.tipoExercicio;
    this.equipamentoIndicado = input.equipamentoIndicado;
    this.principioExtensao = input.principioExtensao;
    this.principioLateral = input.principioLateral;
    this.principioFlexao = input.principioFlexao;
    this.outrosExerciciosInterv = input.outrosExerciciosInterv;
    this.frequencia = input.frequencia;
    this.barreirasRecuperacao = input.barreirasRecuperacao;
    this.objetivosTratamento = input.objetivosTratamento;
    this.createdAt = input.createdAt; 
    this.updatedAt = input.updatedAt; 
 }

  static fromJson(jsonData: IAvaliacao) : Avaliacao { 
    return new Avaliacao(jsonData);
  } 
}
