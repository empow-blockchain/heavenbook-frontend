import en from '../languages/en.json'
import vi from '../languages/vi.json'
// import pl from '../languages/pl.json'
// import pt from '../languages/pt.json'
// import ceb from '../languages/ceb.json'
// import tl from '../languages/tl.json'
// import de from '../languages/de.json'
// import nl from '../languages/nl.json'
// import ko from '../languages/ko.json'
// import hi from '../languages/hi.json'
// import hu from '../languages/hu.json'
// import el from '../languages/el.json'
// import id from '../languages/id.json'
// import it from '../languages/it.json'
// import ms from '../languages/ms.json'
// import my from '../languages/my.json'
// import ru from '../languages/ru.json'
// import ja from '../languages/ja.json'
// import fi from '../languages/fi.json'
// import fr from '../languages/fr.json'
// import ro from '../languages/ro.json'
// import sw from '../languages/sw.json'
// import es from '../languages/es.json'
// import th from '../languages/th.json'
// import ar from '../languages/ar.json'
// import sv from '../languages/sv.json'
// import zh from '../languages/zh.json'
// import uk from '../languages/uk.json'
// import zu from '../languages/zu.json'


const LanguageService = {
    code: 'en',
    languages: {
        en, vi, 
        // pl, pt, ceb, tl, de, nl, ko, hi, hu,
        // el, id, it, ms, my, ru, ja, fi, fr, ro, sw, es,
        // th, ar, sv, zh, uk, zu
    },
    init(code) {
        if (code) {
            this.code = code
        }
    },
    changeLanguage(key) {
        if (!key) {
            return ''
        }

        if (!this.code) {
            return this.languages["en"][key] || key
        }

        return this.languages[this.code][key] || key
    }
}

export default LanguageService