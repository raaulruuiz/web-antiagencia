import AvisoLegal from './pages/AvisoLegal';
import Gracias from './pages/Gracias';
import PoliticaCookies from './pages/PoliticaCookies';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AvisoLegal": AvisoLegal,
    "Gracias": Gracias,
    "PoliticaCookies": PoliticaCookies,
    "PoliticaPrivacidad": PoliticaPrivacidad,
}

export const pagesConfig = {
    mainPage: "AvisoLegal",
    Pages: PAGES,
    Layout: __Layout,
};
