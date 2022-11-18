const { getPrices, amountByBNB, amountByUSDT  } = require('../api/tokenPriceAPI');
const { scrapData } = require('../utils/scrapping');
const { testTransferERC20, swapBNBtoToken } = require('../api/buyToken');
const { isElapsedTime } = require('../utils/utils');
const BOSS_Manager = async (params) => {
    if(!isElapsedTime) {
        console.log("   WARNING : WAIT MORE SECONDS!");
        return;
    }
    const slippageMode = params.slippage;//negative or positive
    if(slippageMode == 1) {
        console.log("   WARNING : Positive Slippage for BOSS");
        return;
    }
    let data = await getPrices(BOSS_DATA.address);
    const BossPrice = data.INUSD;//big or short than thresholdPrice
    if(BossPrice > (priceThreshold*(1+deltaPrice/100))) {
        console.log("   WARNING : BOSS price is more expensive than threshold price");
        return;
    }
    let inAddr = coinSymbol == 'BNB' ? 'BNB' : USDT_ADDR;
    data = await scrapData(inAddr, BOSS_DATA.address, (USDPerTx/BNBPrice));
    const priceImpact = data.PriceImpact;//big or short than initPriceImpact
    if(parseFloat(priceImpact) > parseFloat(initPriceImpact)) {
        console.log("   WARNING : Price impact is more dengerous than initial condition");
        return;
    }
    console.log("*********************************************");
    console.log(`   BOSS Price : ${BossPrice} USD,  Threshold : ${priceThreshold} USD`);
    console.log(`   Slippage Tolerance : ${slippageTolerance}%`);
    console.log(`   Try to buy BOSS for ${USDPerTx}USD(${USDPerTx/BNBPrice})`);
    let bnb = parseFloat(USDPerTx/BNBPrice).toFixed(6);
    let amount = await getAmountsBOSSFromBNB(bnb);
    // let res = swapBNBtoToken(bnb, amount, USDT_ADDR);
    // console.log(res)
    // console.log(amount);
    let res = await swapBNBtoToken(bnb, amount, BOSS_DATA.address);
    if(res.success){
        console.log('********SUCCESS********');
        let amountToken = ((new BN(res.curBal)).sub(new BN(res.prevBal))).toString();
        let decimals = await getDecimals(BOSS_DATA.address);
        amountToken = addDecimals(amountToken, decimals);
        console.log(`BOSS Amount : ${amountToken}`)
        LastTime = new Date();
        spentBNB += bnb;
    }else{
        console.log('********FAILED********');
    }
}

const getAmountsBOSSFromBNB = async (amounBNB) => {
    let realBNB = 0;
    realBNB = amounBNB * (1 - BNBBOSSFEE);
    realBNB = realBNB * (1 - slippageTolerance/100);
    // realBNB = realBNB * (1 - BOSS_DATA.taxFee/100);
    // realBNB = realBNB * (1 - BOSS_DATA.liquidityFee/100);

    // let inAddr = coinSymbol == 'BNB' ? 'BNB' : USDT_ADDR;
    // let data = await scrapData(inAddr, tokenAddr, amounBNB);
    // let priceImpact = data.PriceImpact;
    // realBNB = realBNB * (1 - priceImpact/100);

    return await amountByBNB( realBNB, USDT_ADDR )
}

module.exports = {
    BOSS_Manager
}
 