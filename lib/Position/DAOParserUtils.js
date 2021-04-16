'use strict';

const datumLookupDict = {
    //Ref:  http://www.aprs.org/aprs12/datum.txt
    'w' : 'WGS84',
    'n' : 'NAD27',
    'o' : 'OSGB36',
    '0' : 'Local Custom 0',
    '1' : 'Local Custom 1',
    '2' : 'Local Custom 2',
    '3' : 'Local Custom 3',
    '4' : 'Local Custom 4',
    '5' : 'Local Custom 5',
    '6' : 'Local Custom 6',
    '7' : 'Local Custom 7',
    '8' : 'Local Custom 8',
    '9' : 'Local Custom 9'
};

module.exports = {
    parseDAO: (comment) => {
        //Extact and parse DAO datum and enhanced lat/lon precision for position reports: http://www.aprs.org/aprs12/datum.txt
        const daoMatch = comment.match(/\!([a-zA-Z0-9]{1}[!-{]{2}|[0-9]{2})\!/);
        if (daoMatch) {
            comment = comment.replace(daoMatch[0], '');

            const datumCode = daoMatch[1].substring(0,1);
            let datum;

            //Datum
            if (datumLookupDict[datumCode.toLowerCase()]) {
                datum = datumLookupDict[datumCode.toLowerCase()];
            }
            let latAdjust;
            let lonAdjust;

            //Location is human readable in thousandths of a minute
            if (/^[A-Z]{1}$/.test(datumCode)) {
                latAdjust = parseInt(daoMatch[1].substring(1,2)) / 60000.0; //Divide by 1000 then divide by 60 to go from thousandths of a minute to decimal degres
                lonAdjust = parseInt(daoMatch[1].substring(2,3)) / 60000.0;
            }
            //Location is Base91
            else if (/^[a-z]{1}$/.test(datumCode)){
                latAdjust = parseBase91(daoMatch[1].substring(1,2)) * 1.1 / 600000.0; //Multiply by 1.1 to scale to 100/10000 of a minute, then convert ot decimal degrees
                lonAdjust = parseBase91(daoMatch[1].substring(2,3)) * 1.1 / 600000.0;
            }
            //Local custom datum - With custom datum, the spec is unclear on whether the adjustments should be Base91 or human readable. For now, choosing to ignore them for custom, but still set the datum field
            else {
                latAdjust = 0;
                lonAdjust = 0;
            }

            return {datum, latAdjust, lonAdjust, comment};
        }
        else
            return;
    }
};

function parseBase91(msgString) {
    let value = 0;
    for (let i = 0; i < msgString.length; i++) {
        value = value * 91 + msgString.charCodeAt(i) - 33;
    }
    return value;
}