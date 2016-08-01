'use strict';

class Stats {
    constructor() {
        this.stats = {};
    }
    verifyStat(statName) {
        if (!this.stats[statName])
            this.stats[statName] = [];
    }

    logStat(statName) {
        this.verifyStat(statName);

        this.stats[statName].push(Date.now());
    }

    getStat(statName, seconds) {
        this.verifyStat(statName);

        this.cleanStat(statName, seconds);

        return this.stats[statName].length;
    }

    cleanStat(statName, seconds) {
        this.verifyStat(statName);

        var cTime = Date.now();

        var specificStats = this.stats[statName];

        var spliceAmount = 0;
        specificStats.forEach((time) => {
            if ((cTime - time) > seconds)
                spliceAmount++;
        });

        specificStats.splice(0, spliceAmount);
    }
}

module.exports = Stats;
