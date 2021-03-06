## Eternal bash history
# unset these
# http://stackoverflow.com/questions/9457233/unlimited-bash-history
export HISTFILESIZE= HISTSIZE=
# also append to another file
# in all honesty either one is probably enough
export HISTTIMEFORMAT="%s "
PROMPT_COMMAND="${PROMPT_COMMAND:+$PROMPT_COMMAND ; }"'echo $$ $USER \
               "$(history 1)" >> ~/.bash_eternal_history'


#export PATH=/usr/local/cuda/bin:$PATH
#export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH
#source ~/.bashrc

SSH_ENV="$HOME/.ssh/environment"

function start_agent {
     echo "Initialising new SSH agent..."
     /usr/bin/ssh-agent | sed 's/^echo/#echo/' > "${SSH_ENV}"
     echo succeeded
     chmod 600 "${SSH_ENV}"
     . "${SSH_ENV}" > /dev/null
     /usr/bin/ssh-add;
}

# Source SSH settings, if applicable

if [ -f "${SSH_ENV}" ]; then
     . "${SSH_ENV}" > /dev/null
     #ps ${SSH_AGENT_PID} doesn't work under cywgin
     ps -ef | grep ${SSH_AGENT_PID} | grep ssh-agent$ > /dev/null || {
         start_agent;
     }
else
     start_agent;
fi

#alias ssh='ssh -X'
alias ssh='ssh -YC'
#alias pip-python='pip'
alias batou-ssh='ssh -c arcfour,blowfish-cbc -YC kevin@129.94.12.125'
alias ed='expressvpn disconnect'
alias ec='expressvpn connect smart'
alias es='expressvpn status'
alias sc='screen -ls'
alias scr='screen -r'

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
#S_green="#a8c100"

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

#gconftool-2 --set "/apps/gnome-terminal/profiles/Default/use_theme_background" --type bool false
#gconftool-2 --set "/apps/gnome-terminal/profiles/Default/use_theme_colors" --type bool false
#gconftool-2 --set "/apps/gnome-terminal/profiles/Default/palette" --type string "$color0:$color1:$color2:$color3:$color4:$color5:$color6:$color7:$color8:$color9:$color10:$color11:$color12:$color13:$color14:$color15"



#gconftool-2 --set "/apps/gnome-terminal/profiles/Default/background_color" --type string "$S_base03"
#gconftool-2 --set "/apps/gnome-terminal/profiles/Default/foreground_color" --type string "$S_text"
#gconftool-2 --set "/apps/gnome-terminal/profiles/Default/" --type string "$S_text"


#export CUDA_INSTALL_PATH=/share/ClusterShare/software/centos6/cudatoolkit_4.2.9/cuda/
#export CUSTOMCUDALIB64=/home/kevyin/kevyin/dev/cuda/lib/usr_lib64
#export CUSTOMCUDALIB=/home/kevyin/kevyin/dev/cuda/lib/usr_lib
#export LD_LIBRARY_PATH=/home/kevyin/kevyin/dev/cuda/lib/usr_lib64:$LD_LIBRARY_PATH
#export LD_LIBRARY_PATH=/home/kevyin/kevyin/dev/cuda/lib/usr_lib:$LD_LIBRARY_PATH
#export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH
export PATH=/home/kevin/dev/bin/SABO/cloudbiolinux_install/usr/local/bin:$PATH

#export JAVA_HOME=/home/kevin/dev/bin/jdk1.7.0_60
export JAVA_HOME=/home/kevin/dev/bin/jdk1.7.0_03
export PATH=$JAVA_HOME/bin:$PATH
export MVN_HOME=/home/kevin/dev/bin/apache-maven-3.2.2
export PATH=$MVN_HOME/bin:$PATH
export ANT_HOME=/home/kevin/dev/bin/apache-ant-1.9.4
export PATH=$ANT_HOME/bin:$PATH

if [ -f /etc/profile.modules ]
then
	. /etc/profile.modules
# put your own module loads here
	module load null
fi

prepend_path PATH /home/kevin/dev/bin/sbt/bin/

prepend_path MODULEPATH /home/kevin/dev/modules/
#if [ `hostname -s` -eq `omega-0-11` ]; then
    #ulimit -Sn 10240
#fi
max_fh=`ulimit -Hn`
ulimit -Sn $max_fh

module load java
export PATH=/home/kevin/dev/bin/anaconda2/bin:$PATH


export PATH=/home/kevin/miniconda3/bin:/home/kevin/dev/bin/anaconda2/bin:/home/kevin/dev/bin/sbt/bin/:/home/kevin/dev/bin/apache-ant-1.9.4/bin:/home/kevin/dev/bin/apache-maven-3.2.2/bin:/home/kevin/dev/bin/jdk1.7.0_03/bin:/home/kevin/dev/bin/SABO/cloudbiolinux_install/usr/local/bin:/home/kevin/bin:/home/kevin/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/home/kevin/.vimpkg/bin
