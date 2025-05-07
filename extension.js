/**
 * Created by Jonathan Hoffmann
 * Git Profile Indicator Extension
 */
const { GObject, St, GLib, Gio, Clutter } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const ByteArray = imports.byteArray;
const Util = imports.misc.util;
const Me = imports.misc.extensionUtils.getCurrentExtension();

let indicator;

const GitProfileIndicator = GObject.registerClass(
    class GitProfileIndicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, 'Git Profile Indicator');
    
            // Load your SVG icon
            this._icon = new St.Icon({
                gicon: Gio.icon_new_for_string(Me.path + '/git.svg'),
                style_class: 'system-status-icon',
                icon_size: 16
            });
    
            // Label for the profile info
            this._label = new St.Label({
                text: '...',
                y_align: Clutter.ActorAlign.CENTER
            });
    
            // Horizontal box to hold icon and label
            this._box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
            this._box.add_child(this._icon);
            this._box.add_child(this._label);
    
            this.add_child(this._box);
    
            this._update();
            this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 300, () => {
                this._update();
                return GLib.SOURCE_CONTINUE;
            });
        }
    
        _update() {
            try {
                let [success, out, err, status] = GLib.spawn_command_line_sync('/home/jonathho/OwnTools/gitProfileSwitcher/checkActiveProfile.sh');
    
                if (!success) {
                    this._label.set_text('??');
                    return;
                }
    
                let output = ByteArray.toString(out).trim();
                this._label.set_text(output);
            } catch (e) {
                log(`Git profile check error: ${e}`);
                this._label.set_text('Err');
            }
        }
    
        destroy() {
            if (this._timeout) {
                GLib.source_remove(this._timeout);
                this._timeout = null;
            }
            super.destroy();
        }
    });
    

function init() {}

function enable() {
    indicator = new GitProfileIndicator();
    Main.panel.addToStatusArea('git-profile-indicator', indicator);
    indicator.connect('button-press-event', clickFunction);
}

function disable() {
    if (indicator) {
        indicator.destroy();
        indicator = null;
    }
}

function clickFunction() {
    GLib.spawn_command_line_async('/home/jonathho/OwnTools/gitProfileSwitcher/gitProfileSwitcher.sh');
    if (indicator) {
        indicator._update();
        indicator._update();
        indicator._update();
    }
}