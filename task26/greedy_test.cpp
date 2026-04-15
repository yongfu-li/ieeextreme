#include <algorithm>
#include <iostream>
#include <random>
#include <utility>
#include <vector>
using namespace std;

static vector<int> step(const vector<vector<int>>& g, const vector<int>& in, int v){
    int n=g.size();
    vector<int> mark(n,0),out;
    vector<int> alive=in; alive[v]=0;
    for(int u=0;u<n;u++) if(alive[u]) for(int w:g[u]) if(!mark[w]) mark[w]=1,out.push_back(w);
    vector<int> res(n,0); for(int x:out) res[x]=1; return res;
}

static bool solve_greedy(const vector<vector<int>>& g,int lim){
    int n=g.size();
    vector<int> S(n,1);
    for(int t=0;t<lim;t++){
        int cnt=0; for(int x:S) cnt+=x; if(!cnt) return true;
        int bestv=0,best=1e9;
        for(int v=0;v<n;v++){
            auto T=step(g,S,v); int c=0; for(int x:T)c+=x;
            if(c<best){best=c;bestv=v;}
        }
        S=step(g,S,bestv);
    }
    int cnt=0;for(int x:S)cnt+=x; return cnt==0;
}

int main(){
    mt19937 rng(1);
    for(int n=2;n<=30;n++){
        int fail=0;
        for(int it=0;it<500;it++){
            vector<vector<int>> g(n);
            for(int i=1;i<n;i++){
                int p=uniform_int_distribution<int>(0,i-1)(rng);
                g[i].push_back(p);g[p].push_back(i);
            }
            if(!solve_greedy(g,10*n)) fail++;
        }
        cout<<n<<" fail="<<fail<<"\n";
    }
}
