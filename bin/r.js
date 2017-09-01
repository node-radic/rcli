#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('../src').bootstrapRcli().then(function (cli) {
    cli.start(__dirname + '/../src/commands/r');
})
    .catch(function (reason) {
    throw new Error(reason);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoici5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLEdBQVE7SUFDNUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsb0JBQW9CLENBQUMsQ0FBQTtBQUMvQyxDQUFDLENBQUM7S0FDRyxLQUFLLENBQUMsVUFBQyxNQUFNO0lBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM1QixDQUFDLENBQUMsQ0FBQSJ9