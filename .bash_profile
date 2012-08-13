

export PATH=/usr/local/cuda/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH


alias ssh='ssh -X'

if [ "$COLORTERM" == "gnome-terminal" ]; then
    export TERM=xterm-256color
fi 

#
# define append_path and prepend_path to add directory paths, e.g. PATH, MANPATH.
# add to end of path
#
append_path()
{
    if ! eval test -z "\"\${$1##*:$2:*}\"" -o -z "\"\${$1%%*:$2}\"" -o -z "\"\${$1##$2:*}\"" -o -z "\"\${$1##$2}\"" ; then
	eval "$1=\$$1:$2"
    fi
}

#
# add to front of path
#
prepend_path()
{
    if ! eval test -z "\"\${$1##*:$2:*}\"" -o -z "\"\${$1%%*:$2}\"" -o -z "\"\${$1##$2:*}\"" -o -z "\"\${$1##$2}\"" ; then
	eval "$1=$2:\$$1"
    fi
}

#
# colour variables
#
#BLACK="\[\033[0;30m\]"
#BLUE="\[\033[0;34m\]"
#GREEN="\[\033[0;32m\]"
#CYAN="\[\033[0;36m\]"
#RED="\[\033[0;31m\]"
#PURPLE="\[\033[0;35m\]"
#BROWN="\[\033[0;33m\]"
#LIGHT_GRAY="\[\033[0;37m\]"
#DARK_GRAY="\[\033[1;30m\]"
#LIGHT_BLUE="\[\033[1;34m\]"
#LIGHT_GREEN="\[\033[1;32m\]"
#LIGHT_CYAN="\[\033[1;36m\]"
#LIGHT_RED="\[\033[1;31m\]"
#LIGHT_PURPLE="\[\033[1;35m\]"
#YELLOW="\[\033[1;33m\]"
#WHITE="\[\033[0;37m\]"

# slightly edited Solarized colors by ethanschoonover
S_text="#D3D7CF"
S_base03="#002b36"
S_base02="#073642"
S_base01="#586e75"
S_base00="#657b83"
S_base0="#839496"
S_base1="#93a1a1"
S_base2="#eee8d5"
S_base3="#fdf6e3"
S_yellow="#b58900"
S_orange="#cb4b16"
S_red="#dc322f"
S_magenta="#d33682"
S_violet="#6c71c4"
S_blue="#268bd2"
S_cyan="#2aa198"
S_green="#859900"

# black dark/light
color0=$S_base02
color8=$S_base03

# red dark/light
color1=$S_red
color9=$S_orange

# green dark/light
color2=$S_green
color10=$S_base01

# yellow dark/light
color3=$S_yellow
color11=$S_base00

# blue dark/light
color4=$S_blue
color12=$S_base0

# magenta dark/light
color5=$S_magenta
color13=$S_violet

# cyan dark/light
color6=$S_cyan
color14=$S_base1

# white dark/light
color7=$S_base2
color15=$S_base3

gconftool-2 --set "/apps/gnome-terminal/profiles/Default/use_theme_background" --type bool false
gconftool-2 --set "/apps/gnome-terminal/profiles/Default/use_theme_colors" --type bool false
gconftool-2 --set "/apps/gnome-terminal/profiles/Default/palette" --type string "$color0:$color1:$color2:$color3:$color4:$color5:$color6:$color7:$color8:$color9:$color10:$color11:$color12:$color13:$color14:$color15"



gconftool-2 --set "/apps/gnome-terminal/profiles/Default/background_color" --type string "$S_base03"
gconftool-2 --set "/apps/gnome-terminal/profiles/Default/foreground_color" --type string "$S_text"
#gconftool-2 --set "/apps/gnome-terminal/profiles/Default/" --type string "$S_text"

