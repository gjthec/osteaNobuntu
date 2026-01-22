
import moment from 'moment-timezone';

/**
 * Apresenta no console o dados do horário atual
 */
export default function showTime() {
  // Obtém a hora atual e o fuso horário da máquina
  const now = moment();
  const timezone = moment.tz.guess();
  const currentTime = now.tz(timezone).format('YYYY-MM-DD HH:mm:ss');
  const currentTimeZone = now.tz(timezone).format('Z');

  console.log("==============================================");
  console.log(`Horário atual: ${currentTime}`);
  console.log(`Fuso horário: ${timezone} (UTC${currentTimeZone})`);
  console.log("==============================================");
}
