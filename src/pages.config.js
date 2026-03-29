import AvisoLegal from './pages/AvisoLegal';
import ComoTrabajamos from './pages/ComoTrabajamos';
import Contacto from './pages/Contacto';
import Gracias from './pages/Gracias';
import PoliticaCookies from './pages/PoliticaCookies';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AvisoLegal": AvisoLegal,
    "ComoTrabajamos": ComoTrabajamos,
    "Contacto": Contacto,
    "Gracias": Gracias,
    "PoliticaCookies": PoliticaCookies,
    "PoliticaPrivacidad": PoliticaPrivacidad,
}

export const pagesConfig = {
    mainPage: "AvisoLegal",
    Pages: PAGES,
    Layout: __Layout,
};
