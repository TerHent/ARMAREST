% Template for all kinds of theses at H2T (bachelor thesis, master thesis, ...)
% (c) Christian Dreher, 2019 (based on the template from Stefan Ulbrich, 2012)
% Warning: Do not edit the template file.  For feedback or similar contact
% Christian Dreher: c.dreher@kit.edu

% We do need LaTeX2e
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{template/h2treprt}
\LoadClass[a4paper,twoside,12pt,DIV=11,BCOR=15mm,bibliography=totoc,headings=twolinechapter]{scrreprt} % scrartcl

\pdfminorversion=7

% not using scrhack causes the following warning:
% % Class scrreprt Warning: \float@addtolists detected!
% % (scrreprt)              You should use the features of package `tocbasic'
% % (scrreprt)              instead of \float@addtolists.
% % (scrreprt)              Support for \float@addtolists may be removed from
% % (scrreprt)              `scrreprt' soon .
\usepackage{scrhack}

\ProcessOptions\relax

\RequirePackage{babel}
\usepackage[T1]{fontenc} % Encoding
\usepackage[utf8]{inputenc} % Encoding
\usepackage{graphicx}
\usepackage{grffile}
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{amsthm}
\usepackage{enumerate}
\usepackage{color}
\usepackage{subfigure}
\usepackage{tikz}
\usetikzlibrary{calc}
\usepackage{eso-pic}
\usepackage{booktabs}
\usepackage{helvet} % Different fonts
\usepackage{courier}
\usepackage{newtxtext, newtxmath}  % Replaces mathptmx for fontface + math fontface.
\usepackage{listings} % Source code listings, etc
\usepackage{lastpage}
\usepackage{microtype} % Better typesetting
\usepackage[automark,headsepline]{scrlayer-scrpage}          
\usepackage[inkscapearea=page, inkscapepath=figures/generated]{svg}
\usepackage[round]{natbib}
\usepackage{etoolbox}

% hyperref userpackage moved down here because hyperref should be loaded as the
% last package: http://tex.stackexchange.com/questions/16268/warning-with-footnotes-namehfootnote-xx-has-been-referenced-but-does-not-exi
\usepackage[raiselinks=true,
bookmarks=true,
bookmarksopenlevel=1,
bookmarksopen=true,
bookmarksnumbered=true,
hyperindex=true,
plainpages=false,
pdfpagelabels=true,
pdfborder={0 0 0.5},
colorlinks=false,
pagebackref=true,
linkbordercolor={0 0.61 0.50},
urlbordercolor={0 0.61 0.50},  % for same urlcolor
citebordercolor={0 0.61 0.50},
pdfcreator={LaTeX with H2T thesis template v1.4.1}]{hyperref}  %{0.57 0.74 0.57}

\usepackage[noabbrev,nameinlink]{cleveref}  % Cleveref must be loaded after hyperref.

\definecolor{gray}{rgb}{0.5,0.5,0.5}

\lstloadlanguages{C++,bash,TeX,Python}
\lstset{
    language={[LaTeX]TeX},
    morekeywords={{\gqq},{includegraphics}}
}

\lstset{%
    language=C++,
    morekeywords={includegraphics,citet,citep},
    showstringspaces=false,
    basicstyle=\ttfamily\small,
    keywordstyle=\color{blue},
    commentstyle=\color{gray},
    identifierstyle=\color{black},
    stringstyle=\color{red},
    captionpos=b,
    frame=single,
    frameround=tftf,
    framesep=0.5cm,
    xleftmargin=0.5cm,
    xrightmargin=0.5cm,
    rulecolor=\color{gray},float=htb,
    breaklines=true,
    %escapechar=\% %Enter latex commands in listing
}%

\setlength{\parindent}{0em}
\setlength{\parskip}{1em plus 0.1em minus 0.1em}
\renewcommand{\baselinestretch}{1.2}

\newcommand{\termpaper}{\iflanguage{english}{Term Paper}{Seminararbeit}}
\newcommand{\mastersthesis}{\iflanguage{english}{Master's Thesis}{Masterarbeit}}
\newcommand{\bachelorsthesis}{\iflanguage{english}{Bachelor's Thesis}{Bachelorarbeit}}
\newcommand{\protocol}{\iflanguage{english}{Protocol}{Protokoll}}
\newcommand{\studienarbeit}{\iflanguage{english}{Student Research Project}{Studienarbeit}}
\newcommand{\refereesingular}{\iflanguage{english}{Referee}{Gutachter}}
\newcommand{\refereeplural}{\iflanguage{english}{Referees}{Gutachter}}
\newcommand{\advisorsingular}{\iflanguage{english}{Advisor}{Betreuender Mitarbeiter}}
\newcommand{\advisorplural}{\iflanguage{english}{Advisors}{Betreuende Mitarbeiter}}

\newcommand{\mytitle} 
{\textcolor{red} {Please redefine the \texttt{mytitle} macro \\ \texttt{\Large\textbackslash renewcommand\{\textbackslash mytitle\}\{\dots\}}}}
\newcommand{\mythesis}
{\textcolor{red} {\small Please redefine the \texttt{mythesis} macro, \\ e.g., \texttt{\textbackslash renewcommand\{\textbackslash mythesis\}\{\textbackslash termpaper\}},\\ options: \texttt{\textbackslash mastersthesis, \textbackslash bachelorsthesis, \textbackslash studienarbeit, \textbackslash diplomarbeit}} }

%{\textcolor{red} {\large Please define the \texttt{mythesis} macro:  \texttt{ \textbackslash renewcommand\{\textbackslash mythesis\}\{\dots\}}
%\\ predefined macros are: \textbackslash termpaper, \textbackslash mastersthesis, \textbackslash bachelorsthesis, \textbackslash studienarbeit,
%\textbackslash dioplomarbeit 
%}}
\newcommand{\timeend}{\textcolor{red}{\small Please redefine the \texttt{timeend} macro:  \texttt{ \textbackslash renewcommand\{\textbackslash timeend\}\{\dots\}}}}
\newcommand{\myname}{\textcolor{red}{\large Please redefine the \texttt{myname} macro:  \texttt{ \textbackslash newcommand\{\textbackslash myname\}\{\dots\}}}}
\newcommand{\myshorttitle}{\textcolor{red}{\small Please redefine the \texttt{myshorttitle} macro (may be empty): \texttt{ \textbackslash newcommand\{\textbackslash myshorttitle\}\{\dots\}}}}

\newcommand{\gqq}[1]{\glqq{}#1\grqq{}}
\newcommand{\gq}[1]{\glq{}#1\grq{}}

\newcommand{\myabstract}{}
\newcommand{\mysummary}{}

\newcommand{\abstracttext}[1]{\renewcommand{\myabstract}{#1}}
\newcommand{\summarytext}[1]{\renewcommand{\mysummary}{#1}}

% Page settings
\ihead[]{}
\ifoot[]{}
\ofoot[]{}

\lehead[]{\textnormal{\sffamily \thepage}}
\rehead[]{\textnormal{\sffamily \leftmark}}
\lohead[]{\textnormal{\sffamily \rightmark}}
\rohead[]{\textnormal{\sffamily \thepage}}

%\ohead[]{\textnormal{\sffamily \pagemark}}

\cfoot[\textnormal{\sffamily \thepage}]{}


\addto\captionsenglish{%
    \renewcommand{\contentsname}%
    {Table of Contents}%
}

% Left/Right mark cannot be influenced directly:
\newcommand{\sectionname}{\iflanguage{english}{Section}{Abschnitt}}
\renewcommand{\chaptermark}[1]{\markboth{\textsf{\thechapter.~#1}}{}}
\renewcommand{\sectionmark}[1]{\markright{\textsf{\thesection.~#1}}{}}

\pagestyle{scrheadings} % Commit changes
%\renewcommand{\chapterpagestyle}{scrheadings}

\definecolor{hdrs}{HTML}{555555}

\renewcommand*{\chapterformat}{%
    \mbox{\LARGE\color{hdrs}{\chapappifchapterprefix{\nobreakspace}\thechapter}%
        \IfUsePrefixLine{}{\enskip}}}
\renewcommand*{\sectionformat}{\color{hdrs}{\thesection}\autodot\enskip}
\renewcommand*{\subsectionformat}{\color{hdrs}{\thesubsection}\autodot\enskip}

\renewcommand*{\chapterheadstartvskip}{\vspace*{5cm}}
\renewcommand*{\chapterheadendvskip}{\vspace{1.5cm}}

% Define sections (front-, main- and backmatter)
\newcommand{\frontmatter}{\pagenumbering{roman}}
\newcommand{\mainmatter}{\pagenumbering{arabic}\setcounter{page}{1}}
\newcommand{\backmatter}{%
    \renewcommand*{\chaptermark}[1]{\markboth{\textsf{##1}}{\textsf{##1}}}
    %\renewcommand*{\sectionmark}[1]{\markright{\textsf{\sectionname{} \thesection.~##1}}{}}
}

% Penalize widows and clubs.
\widowpenalty10000
\clubpenalty10000

% Reproducible LaTeX builds.
\pdfinfoomitdate=1
\pdftrailerid{}

%%%%%%%%%%%%% TITLEPAGE %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\renewcommand{\maketitle}{
    \begin{titlepage}
        \thispagestyle{empty}
        \definecolor{cffffff}{RGB}{255,255,255}
        \definecolor{c231f20}{RGB}{35,31,32}
        \definecolor{c00a990}{RGB}{0,169,144}
        
        \begin{tikzpicture}[remember picture,yscale=-1,x=1cm,y=1cm,overlay,shift=(current page.north west)]
        \coordinate (BCOR) at (1.5cm,0.cm);
        \coordinate (upperleft) at ($(BCOR)+(1.5cm,1.5cm)$);
        \coordinate (upperright) at ($(\paperwidth-1.5cm,1.5cm)$);
        \coordinate (upperleftsub) at ($(BCOR)+(1.5cm,4.7cm)$);
        \coordinate (upperrightsub) at ($(\paperwidth-1.5cm,4.7cm)$);
        \coordinate (lowerleft) at ($(BCOR)+(1.5cm,\paperheight-2.0cm)$);
        \coordinate (lowerright) at ($(\paperwidth-1.5cm,\paperheight-2.0cm)$);
        \coordinate (lowerleftsup) at ($(BCOR)+(1.5cm,\paperheight-4.0cm)$);
        \coordinate (lowerrightsup) at ($(\paperwidth-1.5cm,\paperheight-4.0cm)$);
        \coordinate (logoKIT) at ($(upperleft) + (0.75cm,0.75cm)$);
        \coordinate (logotext) at ($(logoKIT) + (0,1.8cm)$);
        \coordinate (logoH2T) at ($(upperleft) + (0.75cm,0.75cm)$);
        \coordinate (footnote) at ($(BCOR) + (1.25cm, \paperheight - 1.5cm)$);
        \coordinate (footnote2) at ($(BCOR) + (1.48cm + \textwidth, \paperheight - 1.5cm)$);
        
        % UPPER LINE
        \draw[ultra thick,black]
        (upperleft) -- (upperright); 
        
        % KIT LOGO
        \node[inner sep=0pt] (KIT) at ($(5.087cm,3.18cm)$) {
            \iflanguage{english}{
                \includegraphics[height=1.87cm]{template/logo_kit_en.pdf}
            }{
                \includegraphics[height=1.87cm]{template/logo_kit_de.pdf}
            }
        };
        
        % DEPARTMENT / LAB INFO
        \node[anchor=north, text width = \paperwidth-5cm] at ($(BCOR)+(14.3cm,2.4cm)$) {
            {\sffamily\bfseries\scriptsize
                KIT\,\,\iflanguage{english}{Department\,\,of\,\,Informatics}{Fakultät\,\,für\,\,Informatik} \par}
            {\sffamily\bfseries\scriptsize \iflanguage{english}{Institute\,\,for\,\,Anthropomatics\,\,and\,\,Robotics}{Institut\,\,für\,\,Anthropomatik\,\,und\,\,Robotik}\,\,(IAR) \par}
            {\sffamily\bfseries\scriptsize \iflanguage{english}{High\,\,Perfomance\,\,Humanoid\,\,Technologies\,\,Lab}{Hochperformante\,\,Humanoide\,\,Technologien}\,\,(H\textsuperscript{2}T) \par}
            {\sffamily\scriptsize Prof.\,\,Dr.-Ing.\,\,Tamim\,\,Asfour \par}
        };
        
        % H2T LOGO
        \node[inner sep=0pt] (H2T) at ($(\paperwidth-3.3cm,3.05cm)$) {
            \iflanguage{english}{
                \includegraphics[height=2.1cm]{template/logo_h2t_en.pdf}
            }{
                \includegraphics[height=2.1cm]{template/logo_h2t_de.pdf}
            }
        };
        
        % UPPER LINE SUB
        \draw[thick,black]
        (upperleftsub) -- (upperrightsub); 
        
        % TYPE, TITLE, NAME, DURATION
        \node[text width = \paperwidth-5cm] at ($(current page.center)+0.5*(BCOR)+(0, -2.5cm)$) {
            \vspace{3.5cm}
            \begin{center}
            {\sffamily\huge\bfseries\mythesis \par}
            \vspace{1.5cm}
            {\sffamily\Huge\mytitle \par}
            {\sffamily\Large\myshorttitle \par}
            \vspace{2cm}
            {\sffamily\huge\bfseries\myname \par}
            \vspace{3cm}
            {\sffamily\large\timeend{} \par}
            \end{center}
        };
        
        % REFEREES/ADVISORS
        \node[anchor=south, outer sep=0.3cm] (refadvinfo) at ($(current page.center)+(0, 0.5*\paperheight-2cm)$) {%
            \ifundef{\refereetwo}%
            {%
                \ifundef{\refereethree}%
                {%
                    \let\refereetext\refereesingular%
                }%
                {%
                    \let\refereetext\refereeplural%
                }%
            }%
            {%
                \let\refereetext\refereeplural%
            }%
            %
            \ifundef{\advisortwo}%
            {%
                \ifundef{\advisorthree}%
                {%
                    \let\advisortext\advisorsingular%
                }%
                {%
                    \let\advisortext\advisorplural%
                }%
            }%
            {%
                \let\advisortext\advisorplural%
            }%
            
            \begin{tabular}[ht]{rl}%
            \ifundef{\referee}{}{ \sffamily\large\refereetext{}: & \sffamily\large\referee{}\\ }%
            \ifundef{\refereetwo}{}{ & \sffamily\large\refereetwo{}\\ }%
            \ifundef{\refereethree}{}{ & \sffamily\large\refereethree{}\\ }%
            
            \addlinespace[0.6cm]%
            
            \ifundef{\advisor}{}{ \sffamily\large\advisortext{}: & \sffamily\large\advisor{}\\ }%
            \ifundef{\advisortwo}{}{ & \sffamily\large\advisortwo{}\\ }%
            \ifundef{\advisorthree}{}{ & \sffamily\large\advisorthree{}\\ }%
            
            \end{tabular}%
        };
        
        % LOWER LINE SUPER
        \draw[thick,black]
        (lowerleftsup |- refadvinfo.north) -- (lowerrightsup |- refadvinfo.north);
        
        % LOWER LINE
        \draw[ultra thick,black]
        (lowerleft) -- (lowerright);
        
        \end{tikzpicture}
    \end{titlepage}
    
    \cleardoublepage
}


\newcommand{\makedeclaration}
{
    % Backup currently used language and set ngerman for this page.
    \let\oldlanguage\languagename
    \selectlanguage{ngerman}
    
    \thispagestyle{plain}
    \newpage
    %\topskip0pt
    %\vspace*{\fill}
    \noindent
    \chapter*{Eidesstattliche Erklärung}
    \vspace*{10em}
    
    \noindent
    Ich versichere hiermit, dass ich die Arbeit selbstständig verfasst habe, keine anderen als die angegebenen Quellen und Hilfsmittel benutzt habe, die wörtlich oder inhaltlich übernommenen
    Stellen als solche kenntlich gemacht habe und die Satzung des Karlsruher Instituts für Technologie zur Sicherung guter wissenschaftlicher Praxis beachtet habe.
    \vspace*{2em}
    
    \noindent
    Karlsruhe, den \timeend{}
    \begin{flushright}
        $\overline{\mbox{\hspace*{2cm}\myname{}\hspace*{2cm}}}$
    \end{flushright}
    
    % Restore previously used language.
    \expandafter\selectlanguage\expandafter{\oldlanguage}
    
    %\vspace*{\fill}
    \cleardoublepage
}

% Load H2T specific definitions.
\input{h2t_def}
