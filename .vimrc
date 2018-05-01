set nocompatible               " be iMproved
filetype off                   " required!

execute pathogen#infect()

let mapleader=","

if !exists("g:ycm_semantic_triggers")
  let g:ycm_semantic_triggers = {}
endif
let g:ycm_semantic_triggers['typescript'] = ['.']


" START Scala-Java-Edit suggested settings
let mapleader=","
let g:javae_locate_cmd = "locate"

" Java Stuff
let JAVASOURCEPATH = "$JAVA_HOME/src" .
            \",$HOME/java/xerces/xerces/src" .
            \",$HOME/java/xerces/xalan/src" .
            \",$HOME/java/jboss/jboss" .
            \",$HOME/java/jakarta/commons-lang/src/java" .
            \",$HOME/java/jakarta/commons-collections/src/java" .
            \",$HOME/java/jakarta/jakarta-tomcat/jakarta-servletapi-5/jsr154/src/share/"
" Note that for Java, only search for files with the 'java' suffix
" goto
autocmd FileType java map <Leader>g :call EditSource('e',['java'],=,JAVASOURCEPATH)<CR>
" horizontal
autocmd FileType java map <Leader>h :call EditSource('sp',['java'],=,JAVASOURCEPATH)<CR>
" vertical
autocmd FileType java map <Leader>v :call EditSource('vsp',['java'],=,JAVASOURCEPATH)<CR>

" if you want to debug, comment out above line and uncomment below line
"map <Leader>g :debug:call EditSource('e',JAVASOURCEPATH)<CR>

" Scala Stuff
let SCALASOURCEPATH = "$SCALA_HOME/src" .
            \",$SVN_HOME/project1/src/main/scala" .
            \",$SVN_HOME/project1/src/test/scala" .
            \",$SVN_HOME/project2/src/main/scala" .
            \",$SVN_HOME/project2/src/test/scala" .
            \",$JAVA_HOME/src"

" Note that for Scala, search for files with the 'scala' and
"    then 'java' suffixes
" goto
autocmd FileType scala map <Leader>g :call EditSource('e',['scala', 'java'],SCALASOURCEPATH)<CR>
" horizontal
autocmd FileType scala map <Leader>h :call EditSource('sp',['scala', 'java'],SCALASOURCEPATH)<CR>
" vertical
autocmd FileType scala map <Leader>v :call EditSource('vsp',['scala', 'java'],SCALASOURCEPATH)<CR> 
" END Scala-Java-Edit suggested settings


filetype plugin indent on     " required!
"
"set mouse=a
set tabstop=4
set shiftwidth=4
set ruler
set showmatch
set incsearch
set ignorecase
set cindent
set smartindent
set autoindent
set expandtab
set cinkeys=0{,0},:,0#,!^F
set number
set hlsearch
set paste

set formatoptions+=r

syntax on
syn on

filetype plugin on

let NERD_haskell_alt_style=1

au BufNewFile,BufRead *.tem set filetype=cpp
au BufNewFile,BufRead *.cu set filetype=cpp
au BufNewFile,BufRead *.h set filetype=cpp
au BufNewFile,BufRead *.scala set filetype=scala

nmap <silent> <c-n> :NERDTreeToggle<CR>
let NERDTreeWinSize=42

let python_highlight_all = 1
syntax enable
set background=light
colorscheme solarized
if has('gui_running')
	set background=light
else
	set background=dark
endif

"synpastic
"set statusline+=%#warningmsg#
"set statusline+=%{SyntasticStatuslineFlag()}
"set statusline+=%*

"let g:syntastic_always_populate_loc_list = 1
"let g:syntastic_auto_loc_list = 1
"let g:syntastic_check_on_open = 1
"let g:syntastic_check_on_wq = 0
