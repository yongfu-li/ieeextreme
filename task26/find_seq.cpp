#include <algorithm>
#include <deque>
#include <iostream>
#include <unordered_map>
#include <utility>
#include <vector>
using namespace std;

int main(){
    int n,m;cin>>n>>m;
    vector<int> adj(n,0);
    for(int i=0;i<m;i++){int u,v;cin>>u>>v;--u;--v;adj[u]|=1<<v;adj[v]|=1<<u;}
    int full=(1<<n)-1;
    vector<int> dist(1<<n,-1),preS(1<<n,-1),preV(1<<n,-1);
    deque<int> q; q.push_back(full); dist[full]=0;
    while(!q.empty()){
        int s=q.front();q.pop_front();
        if(s==0) break;
        if(dist[s]>=10*n) continue;
        for(int v=0;v<n;v++){
            int s2=s&~(1<<v),ns=0,x=s2;
            while(x){int b=x&-x;int i=__builtin_ctz((unsigned)b);x-=b;ns|=adj[i];}
            if(dist[ns]==-1){
                dist[ns]=dist[s]+1;preS[ns]=s;preV[ns]=v;q.push_back(ns);
            }
        }
    }
    if(dist[0]==-1){cout<<"-1\n";return 0;}
    vector<int> seq;int cur=0;
    while(cur!=full){seq.push_back(preV[cur]+1);cur=preS[cur];}
    reverse(seq.begin(),seq.end());
    cout<<seq.size()<<"\n";
    for(int v:seq) cout<<v<<" ";
    cout<<"\n";
}
