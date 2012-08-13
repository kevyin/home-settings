if $COLORTERM == 'gnome-terminal'
    "set t_Co=256
    set t_Co=16
endif

"vundle
set nocompatible               " be iMproved
filetype off                   " required!

set rtp+=~/.vim/bundle/vundle/
call vundle#rc()

" let Vundle manage Vundle
" " required! 
Bundle 'gmarik/vundle'
"
" " My Bundles here:
" "
" " original repos on github
"Bundle 'tpope/vim-fugitive'
"Bundle 'Lokaltog/vim-easymotion'
"Bundle 'rstacruz/sparkup', {'rtp': 'vim/'}
"Bundle 'tpope/vim-rails.git'
" " vim-scripts repos
Bundle 'scrooloose/nerdcommenter'
let mapleader=","
Bundle 'scrooloose/nerdtree'
Bundle 'UltiSnips'
Bundle 'haskell.vim'
Bundle 'notes.vim'

Bundle 'Wombat'
Bundle 'Zenburn'
"colorscheme zenburn 
Bundle 'Solarized'
"set background=dark
"let g:solarized_termcolors=16
"colorscheme solarized 

"Bundle 'L9'
"Bundle 'FuzzyFinder'
" " non github repos
"Bundle 'git://git.wincent.com/command-t.git'
" " ...
"
filetype plugin indent on     " required!

" "
" " Brief help
" " :BundleList          - list configured bundles
" " :BundleInstall(!)    - install(update) bundles
" " :BundleSearch(!) foo - search(or refresh cache
" first) for foo
" " :BundleClean(!)      - confirm(or auto-approve)
" removal of unused bundles
" "
" " see :h vundle for more details or wiki for FAQ
" " NOTE: comments after Bundle command are not
" allowed..


set mouse=a
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

syntax on

filetype plugin on

nmap <silent> <c-n> :NERDTreeToggle<CR>

let NERD_haskell_alt_style=1

au BufNewFile,BufRead *.tem set filetype=cpp
au BufNewFile,BufRead *.cu set filetype=cpp
au BufNewFile,BufRead *.h set filetype=cpp

