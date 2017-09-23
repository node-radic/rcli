#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log(process.uptime(), 'bin');
require('../src').bootstrapRcli().then(function (cli) {
    console.log(process.uptime(), 'start');
    cli.start(__dirname + '/../src/commands/r');
}).catch(function (reason) {
    throw new Error(reason);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoici5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFFcEMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLEdBQVE7SUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDdEMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsb0JBQW9CLENBQUMsQ0FBQTtBQUMvQyxDQUFDLENBQUMsQ0FBSyxLQUFLLENBQUMsVUFBQyxNQUFNO0lBRWhCLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEIsQ0FBQyxDQUFDLENBQUEifQ==