window.CONFIG={W:100,H:100,TILE:32,SAVE_KEY:'idleFrontierSaveV1',SAVE_VERSION:1,MAX_LEVEL:99,STACK:250,ACTION_CATCHUP_MS:120000,LOG_LIMIT:90,START:{x:50,y:52},tierReq:[0,1,10,30,50,80]};
function xpForLevel(l){if(l<=1)return 0;return Math.floor(55*(Math.pow(l-1,2.18))+120*(l-1));}
function levelForXp(xp){let l=1;while(l<CONFIG.MAX_LEVEL&&xp>=xpForLevel(l+1))l++;return l;}
