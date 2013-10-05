set nocompatible               " be iMproved
filetype off                   " required!

set rtp+=~/.vim/bundle/vundle/
call vundle#rc()

" let Vundle manage Vundle
" required! 
Bundle 'gmarik/vundle'

" My Bundles here:
"
" original repos on github
"Bundle 'tpope/vim-fugitive'
"Bundle 'Lokaltog/vim-easymotion'
"Bundle 'rstacruz/sparkup', {'rtp': 'vim/'}
"Bundle 'tpope/vim-rails.git'
" vim-scripts repos
" Bundle 'L9'
" Bundle 'FuzzyFinder'
" non github repos
" Bundle 'git://git.wincent.com/command-t.git'
" ...
Bundle "The-NERD-tree"
Bundle 'The-NERD-Commenter'
let mapleader=","
Bundle 'surround.vim'
Bundle 'LargeFile'
Bundle 'fugitive.vim'
"Bundle 'Tagbar'
"nmap <silent> <c-m> :TagbarToggle<CR>
Bundle 'derekwyatt/vim-scala'
Bundle 'jistr/vim-nerdtree-tabs'

Bundle 'Scala-Java-Edit'

" START Scala-Java-Edit suggested settings
let mapleader=","
let g:javae_locate_cmd = "locate"
source $HOME/.vim/bundle/Scala-Java-Edit/plugin/scalajavaedit.vim

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
" Brief help
" :BundleList          - list configured bundles
" :BundleInstall(!)    - install(update) bundles
" :BundleSearch(!) foo - search(or refresh cache first) for foo
" :BundleClean(!)      - confirm(or auto-approve) removal of unused bundles
"
" see :h vundle for more details or wiki for FAQ
" NOTE: comments after Bundle command are not allowed..
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

set formatoptions+=r

syntax on
syn on

filetype plugin on

let NERD_haskell_alt_style=1

au BufNewFile,BufRead *.tem set filetype=cpp
au BufNewFile,BufRead *.cu set filetype=cpp
au BufNewFile,BufRead *.h set filetype=cpp
au BufNewFile,BufRead *.scala set filetype=scala

nmap <silent> <c-n> :NERDTreeTabsToggle<CR>
let NERDTreeWinSize=42
