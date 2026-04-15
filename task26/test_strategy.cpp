#include <algorithm>
#include <iostream>
#include <functional>
#include <random>
#include <utility>
#include <vector>
using namespace std;

static bool guaranteed(int n, const vector<pair<int,int>>& edges, const vector<int>& seq){
    vector<int> adj(n,0);
    for(auto [u,v]:edges){adj[u]|=1<<v;adj[v]|=1<<u;}
    int S=(1<<n)-1;
    for(int v:seq){
        int S2=S&~(1<<v),T=0,x=S2;
        while(x){int b=x&-x;int i=__builtin_ctz((unsigned)b);x-=b;T|=adj[i];}
        S=T;
    }
    return S==0;
}

int main(){
    mt19937 rng(1);
    for(int n=2;n<=12;n++){
        bool ok=true;
        for(int it=0;it<3000;it++){
            vector<pair<int,int>> edges;
            for(int i=1;i<n;i++){
                int p=uniform_int_distribution<int>(0,i-1)(rng);
                edges.push_back({i,p});
            }
            vector<vector<int>> g(n);
            for(auto [u,v]:edges){g[u].push_back(v);g[v].push_back(u);}
            vector<int> core_nodes;
            for(int i=0;i<n;i++) if((int)g[i].size()>=2) core_nodes.push_back(i);
            vector<int> seq;
            if(core_nodes.empty()){
                seq={0,0};
            }else{
                vector<int> is_core(n,0); for(int x:core_nodes) is_core[x]=1;
                vector<vector<int>> cg(n);
                for(auto [u,v]:edges) if(is_core[u]&&is_core[v]){cg[u].push_back(v);cg[v].push_back(u);}
                int root=core_nodes[0];
                for(int x:core_nodes) if((int)cg[x].size()<=1){root=x;break;}
                function<void(int,int,bool)> dfs=[&](int u,int p,bool must_return){
                    seq.push_back(u);
                    vector<int> ch;
                    for(int v:cg[u]) if(v!=p) ch.push_back(v);
                    for(int i=0;i<(int)ch.size();i++){
                        bool child_ret=true;
                        if(i+1==(int)ch.size() && !must_return) child_ret=false;
                        dfs(ch[i],u,child_ret);
                        if(child_ret) seq.push_back(u);
                    }
                };
                dfs(root,-1,false);
                vector<int> rev=seq; reverse(rev.begin(),rev.end()); seq.insert(seq.end(),rev.begin(),rev.end());
            }
            if(!guaranteed(n,edges,seq)){
                ok=false;
                cout<<"fail tree n="<<n<<"\n";
                for(auto [u,v]:edges) cout<<u+1<<" "<<v+1<<"\n";
                return 0;
            }
        }
        cout<<n<<" "<<(ok?"ok":"fail")<<"\n";
    }
}
