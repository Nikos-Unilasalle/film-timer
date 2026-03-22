const translations = {
  fr: {
    /* Navbar */
    fullscreen: "⛶ Plein écran",
    print: "🖨 Mémo",
    settings: "⚙ Paramètres",

    /* Setup Header */
    setup_title: "Configurer la séquence",
    setup_subtitle: "Renseignez vos bains, durées et options de retournement",

    /* Presets */
    preset_title: "⚗ Préset",
    preset_default: "Choisir un préset…",
    btn_save: "💾 Enregistrer",
    btn_export: "⬇️ Exporter",
    btn_import: "⬆️ Importer",

    /* Global Options */
    global_title: "Options globales",
    global_offset: "Offset sonnerie fin de bain (s)",
    global_offset_hint: "Sonnerie X secondes avant la fin",
    global_auto: "Enchainement automatique",
    auto_manual: "Manuel",
    auto_auto: "Auto",

    /* Agitation */
    agit_title: "Retournements — réglages par défaut",
    agit_freq: "Fréquence (toutes les X secondes)",
    agit_dur: "Durée sonnerie (s)",
    agit_sound: "Son retournement",
    end_sound: "Son fin de bain",
    sound_click: "Clic",
    sound_beep: "Bip court",
    sound_bell: "Cloche",
    sound_ping: "Ping",
    sound_wood: "Bloc bois",
    sound_soft: "Doux",
    sound_double: "Double bip",
    sound_low: "Grave",
    sound_glass: "Verre",
    sound_alarm: "Alarme",
    sound_chime: "Carillon",
    sound_fanfare: "Fanfare",

    /* Corrections */
    corr_title: "🌡 Corrections temporelles",
    corr_temp: "Température",
    temp_ref: "Temp. de référence (°C)",
    temp_real: "Temp. réelle (°C)",
    corr_calc: "Correction calculée",
    temp_neutral: "Aucun écart",
    corr_exhaust: "Épuisement du révélateur",
    roll_count: "Pellicules 36p déjà développées",
    roll_comp: "Compensation (% par pellicule)",
    roll_added: "Ajout de temps (bains cochés)",
    roll_hint: "Activer ↓ par bain révélateur",
    corr_iso: "🎥 Compensation ISO / Push-Pull",
    iso_ref: "ISO de référence (vitesse du film)",
    iso_real: "ISO utilisé à la prise de vue",
    iso_factor: "Facteur par stop (%)",
    iso_factor_hint: "Défaut : 33% / stop",
    iso_disclaimer: "⚠️ Valeur indicative — vérifiez la fiche technique de votre film/révélateur pour les temps de push.",

    /* Baths */
    baths_title: "Bains",
    btn_add_bath: "+ Ajouter un bain",
    btn_start_seq: "▶ Démarrer la séquence",

    /* Bath Template */
    bath_name_ph: "Nom du bain (ex: Révélateur)",
    bath_dur: "Durée (mm:ss)",
    bath_msg: "Message optionnel",
    bath_offset: "Offset sonnerie fin (s)",
    bath_agit_en: "Activer les retournements",
    bath_apply_corr: "Appliquer corrections (temp. + épuisement + ISO)",
    default_global: "Défaut global",

    /* Timer */
    seq_label: "Séquence",
    agit_label: "Retournement",
    btn_pause: "⏸ Pause",
    btn_resume: "▶ Reprendre",
    btn_next: "Continuer →",
    btn_stop: "✕ Arrêter",
    btn_start: "▶ Commencer",

    /* Done */
    done_title: "Séquence terminée !",
    done_text: "Toutes les étapes ont été complétées avec succès.",
    btn_restart: "↺ Recommencer",

    /* Modals */
    memo_title: "Fiche mémo — développement",
    btn_do_print: "🖨 Imprimer",
    btn_close: "✕ Fermer",
    set_title: "⚙ Paramètres audio",
    set_text: "Les sons sont générés via l'API Web Audio. Testez-les ici :",
    master_vol: "Volume général",

    /* JS Messages */
    js_msg_cold: "▼ Plus chaud — écart",
    js_msg_hot: "▲ Plus froid — écart",
    js_msg_0stop: "0 stop — aucun écart",
    js_msg_push: "Push",
    js_msg_pull: "Pull",
    js_msg_stop: "stop",
    js_msg_stops: "stops",
    js_err_empty: "Ajoutez au moins un bain avant d'enregistrer !",
    js_prompt_name: "Nom de votre séquence de développement :",
    js_saved: "Séquence enregistrée ! Elle sera disponible la prochaine fois dans le menu.",
    js_del_confirm: "Supprimer définitivement le préset",
    js_stop_confirm: "Voulez-vous vraiment arrêter la séquence en cours ?",
    js_import_ok: "Préset importé avec succès !",

    /* Preset Baths */
    b_dev: "Révélateur",
    b_stop: "Bain d'arrêt",
    b_fix: "Fixateur",
    b_wash: "Lavage"
  },
  en: {
    /* Navbar */
    fullscreen: "⛶ Fullscreen",
    print: "🖨 Print",
    settings: "⚙ Settings",

    /* Setup Header */
    setup_title: "Setup Sequence",
    setup_subtitle: "Configure your baths, durations and agitation options",

    /* Presets */
    preset_title: "⚗ Presets",
    preset_default: "Choose a preset…",
    btn_save: "💾 Save",
    btn_export: "⬇️ Export",
    btn_import: "⬆️ Import",

    /* Global Options */
    global_title: "Global Options",
    global_offset: "End alarm offset (sec)",
    global_offset_hint: "Rings X seconds before end",
    global_auto: "Auto Advance",
    auto_manual: "Manual",
    auto_auto: "Auto",

    /* Agitation */
    agit_title: "Agitation — defaults",
    agit_freq: "Frequency (every X sec)",
    agit_dur: "Alarm duration (sec)",
    agit_sound: "Agitation Sound",
    end_sound: "End Sound",
    sound_click: "Click",
    sound_beep: "Short beep",
    sound_bell: "Bell",
    sound_ping: "Ping",
    sound_wood: "Woodblock",
    sound_soft: "Soft",
    sound_double: "Double beep",
    sound_low: "Low tone",
    sound_glass: "Glass",
    sound_alarm: "Alarm",
    sound_chime: "Chime",
    sound_fanfare: "Fanfare",

    /* Corrections */
    corr_title: "🌡 Time Corrections",
    corr_temp: "Bath Temperature",
    temp_ref: "Reference Temp. (°C)",
    temp_real: "Real Temp. (°C)",
    corr_calc: "Calculated correction",
    temp_neutral: "No variance",
    corr_exhaust: "Developer Exhaustion",
    roll_count: "36exp rolls developed",
    roll_comp: "Compensation (% / roll)",
    roll_added: "Added time (checked baths)",
    roll_hint: "Enable ↓ per developer bath",
    corr_iso: "🎥 ISO Compensation / Push-Pull",
    iso_ref: "Reference ISO (Box speed)",
    iso_real: "Shot ISO",
    iso_factor: "Factor per stop (%)",
    iso_factor_hint: "Default: 33% / stop",
    iso_disclaimer: "⚠️ Indicative value — check your film/developer datasheet for precise push times.",

    /* Baths */
    baths_title: "Baths",
    btn_add_bath: "+ Add Bath",
    btn_start_seq: "▶ Start Sequence",

    /* Bath Template */
    bath_name_ph: "Bath target (e.g. Developer)",
    bath_dur: "Duration (mm:ss)",
    bath_msg: "Optional message",
    bath_offset: "End alarm offset (s)",
    bath_agit_en: "Enable Agitation",
    bath_apply_corr: "Apply corrections (temp, exhaust., ISO)",
    default_global: "Global default",

    /* Timer */
    seq_label: "Sequence",
    agit_label: "Agitation",
    btn_pause: "⏸ Pause",
    btn_resume: "▶ Resume",
    btn_next: "Continue →",
    btn_stop: "✕ Stop",
    btn_start: "▶ Start",

    /* Done */
    done_title: "Sequence complete!",
    done_text: "All steps have been successfully completed.",
    btn_restart: "↺ Restart",

    /* Modals */
    memo_title: "Development Memo Sheet",
    btn_do_print: "🖨 Print",
    btn_close: "✕ Close",
    set_title: "⚙ Audio Settings",
    set_text: "Sounds are generated using the Web Audio API. Test them here:",
    master_vol: "Master Volume",

    /* JS Messages */
    js_msg_cold: "▼ Warmer — drift",
    js_msg_hot: "▲ Colder — drift",
    js_msg_0stop: "0 stops — no variance",
    js_msg_push: "Push",
    js_msg_pull: "Pull",
    js_msg_stop: "stop",
    js_msg_stops: "stops",
    js_err_empty: "Add at least one bath before saving!",
    js_prompt_name: "Name of your sequence:",
    js_saved: "Sequence saved! It will be available next time in the dropdown.",
    js_del_confirm: "Permanently delete preset",
    js_stop_confirm: "Are you sure you want to stop the current sequence?",
    js_import_ok: "Preset successfully imported!",

    /* Preset Baths - Hardcoded English names */
    b_dev: "Developer",
    b_stop: "Stop Bath",
    b_fix: "Fixer",
    b_wash: "Washing"
  }
};

let currentLang = localStorage.getItem('filmtimer_lang') || (navigator.language.startsWith('fr') ? 'fr' : 'en');
if(!translations[currentLang]) currentLang = 'en';

function _t(key) {
  return translations[currentLang][key] || key;
}

function switchLang(lang) {
  currentLang = lang;
  localStorage.setItem('filmtimer_lang', lang);
  updateAllStrings();
}

function updateAllStrings() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = _t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = _t(el.getAttribute('data-i18n-ph'));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = _t(el.getAttribute('data-i18n-title'));
  });

  // Highlight active lang btn
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });

  // Re-render dynamic JS pieces if they are active
  if(typeof updateCorrectionPreviews === 'function') updateCorrectionPreviews();
  if(typeof renderPresetsDropdown === 'function') renderPresetsDropdown();
}

window.addEventListener('DOMContentLoaded', () => {
  updateAllStrings();
});
