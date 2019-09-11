const cron = require('cron');

var tuan = 1
function test(){
	while(tuan < 100){
	if (tuan <50) {
		console.log("chua chay");
	}else{
		const job = new cron.CronJob({
		  cronTime: '*/1 * * * * 0-6', // Chạy Jobs vào 23h30 hằng đêm
		  onTick: function() {
		    console.log('Cron jub runing...');
		  },
		  start: true, 
		  timeZone: 'Asia/Ho_Chi_Minh' // Lưu ý set lại time zone cho đúng 
		});

		job.start();	
		
		}
	tuan++;
}

}

test()